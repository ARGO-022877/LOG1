import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import * as neo4j from 'neo4j-driver';

// Initialize Firebase Admin
admin.initializeApp();

// Neo4j driver instance
let neo4jDriver: neo4j.Driver | null = null;

async function getNeo4jDriver(): Promise<neo4j.Driver> {
  if (!neo4jDriver) {
    const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
    const user = process.env.NEO4J_USER || 'neo4j';
    const password = process.env.NEO4J_PASSWORD || 'password';
    
    neo4jDriver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }
  
  return neo4jDriver;
}

// Query API for knowledge extraction
export const queryKnowledge = onRequest({
  region: 'us-central1',
  cors: true
}, async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    const { query, type } = req.body;
    
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query is required and must be a string' });
      return;
    }
    
    const driver = await getNeo4jDriver();
    const session = driver.session();
    
    let cypherQuery: string;
    const params: Record<string, unknown> = {};
    
    if (type === 'cypher') {
      // Direct Cypher query (for advanced users)
      cypherQuery = query;
    } else {
      // Natural language to Cypher conversion (simplified)
      cypherQuery = convertNaturalLanguageToCypher(query);
    }
    
    console.log('Executing Cypher query:', cypherQuery);
    
    const result = await session.run(cypherQuery, params);
    const records = result.records;
    
    // Transform Neo4j records to knowledge graph format
    const nodes: Array<{
      id: string;
      label: string;
      type: string;
      properties: Record<string, unknown>;
    }> = [];
    const relationships: Array<{
      id: string;
      startNode: string;
      endNode: string;
      type: string;
      properties: Record<string, unknown>;
    }> = [];
    const nodeIds = new Set<string>();
    
    records.forEach(record => {
      record.keys.forEach(key => {
        const value = record.get(key);
        
        if (value && typeof value === 'object') {
          if (value.constructor.name === 'Node') {
            const nodeId = value.identity.toString();
            if (!nodeIds.has(nodeId)) {
              nodes.push({
                id: nodeId,
                label: value.properties.name || value.properties.title || value.labels[0] || 'Unknown',
                type: value.labels[0]?.toLowerCase() || 'unknown',
                properties: value.properties || {}
              });
              nodeIds.add(nodeId);
            }
          } else if (value.constructor.name === 'Relationship') {
            relationships.push({
              id: value.identity.toString(),
              startNode: value.start.toString(),
              endNode: value.end.toString(),
              type: value.type,
              properties: value.properties || {}
            });
          }
        }
      });
    });
    
    await session.close();
    
    res.json({
      success: true,
      data: {
        nodes,
        relationships
      },
      message: `Found ${nodes.length} nodes and ${relationships.length} relationships`
    });
    
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute query: ' + (error instanceof Error ? error.message : 'Unknown error')
    });
  }
});

// Convert natural language to Cypher query (simplified implementation)
function convertNaturalLanguageToCypher(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  // Simple pattern matching for common queries
  if (lowerQuery.includes('모든') || lowerQuery.includes('전체')) {
    if (lowerQuery.includes('개발자') || lowerQuery.includes('developer')) {
      return 'MATCH (d:Developer) RETURN d LIMIT 50';
    }
    if (lowerQuery.includes('세션') || lowerQuery.includes('session')) {
      return 'MATCH (s:Session) RETURN s LIMIT 50';
    }
    if (lowerQuery.includes('개념') || lowerQuery.includes('concept')) {
      return 'MATCH (c:Concept) RETURN c LIMIT 50';
    }
    return 'MATCH (n) RETURN n LIMIT 50';
  }
  
  if (lowerQuery.includes('관계') || lowerQuery.includes('연결') || lowerQuery.includes('relationship')) {
    return 'MATCH (a)-[r]->(b) RETURN a, r, b LIMIT 50';
  }
  
  if (lowerQuery.includes('학습') || lowerQuery.includes('learn')) {
    return 'MATCH (d:Developer)-[:LEARNED]->(c:Concept) RETURN d, c LIMIT 50';
  }
  
  if (lowerQuery.includes('프로젝트') || lowerQuery.includes('project')) {
    return 'MATCH (p:Project) RETURN p LIMIT 50';
  }
  
  if (lowerQuery.includes('경험') || lowerQuery.includes('experience')) {
    return 'MATCH (d:Developer) WHERE d.experienceLevel IS NOT NULL RETURN d LIMIT 50';
  }
  
  // Default query for general exploration
  return 'MATCH (n) RETURN n LIMIT 20';
}

// Cleanup function
process.on('SIGTERM', async () => {
  if (neo4jDriver) {
    await neo4jDriver.close();
  }
});