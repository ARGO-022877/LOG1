"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryKnowledge = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const neo4j = __importStar(require("neo4j-driver"));
// Initialize Firebase Admin
admin.initializeApp();
// Neo4j driver instance
let neo4jDriver = null;
async function getNeo4jDriver() {
    if (!neo4jDriver) {
        const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
        const user = process.env.NEO4J_USER || 'neo4j';
        const password = process.env.NEO4J_PASSWORD || 'password';
        neo4jDriver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    }
    return neo4jDriver;
}
// Query API for knowledge extraction
exports.queryKnowledge = (0, https_1.onRequest)({
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
        let cypherQuery;
        const params = {};
        if (type === 'cypher') {
            // Direct Cypher query (for advanced users)
            cypherQuery = query;
        }
        else {
            // Natural language to Cypher conversion (simplified)
            cypherQuery = convertNaturalLanguageToCypher(query);
        }
        console.log('Executing Cypher query:', cypherQuery);
        const result = await session.run(cypherQuery, params);
        const records = result.records;
        // Transform Neo4j records to knowledge graph format
        const nodes = [];
        const relationships = [];
        const nodeIds = new Set();
        records.forEach(record => {
            record.keys.forEach(key => {
                var _a;
                const value = record.get(key);
                if (value && typeof value === 'object') {
                    if (value.constructor.name === 'Node') {
                        const nodeId = value.identity.toString();
                        if (!nodeIds.has(nodeId)) {
                            nodes.push({
                                id: nodeId,
                                label: value.properties.name || value.properties.title || value.labels[0] || 'Unknown',
                                type: ((_a = value.labels[0]) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || 'unknown',
                                properties: value.properties || {}
                            });
                            nodeIds.add(nodeId);
                        }
                    }
                    else if (value.constructor.name === 'Relationship') {
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
    }
    catch (error) {
        console.error('Query error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to execute query: ' + (error instanceof Error ? error.message : 'Unknown error')
        });
    }
});
// Convert natural language to Cypher query (simplified implementation)
function convertNaturalLanguageToCypher(query) {
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
// Export realtime functions
__exportStar(require("./realtime"), exports);
// Cleanup function
process.on('SIGTERM', async () => {
    if (neo4jDriver) {
        await neo4jDriver.close();
    }
});
//# sourceMappingURL=index.js.map