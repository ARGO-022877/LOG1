export interface KnowledgeNode {
  id: string;
  label: string;
  type: 'concept' | 'entity' | 'relationship' | 'document';
  properties: Record<string, unknown>;
}

export interface KnowledgeRelationship {
  id: string;
  startNode: string;
  endNode: string;
  type: string;
  properties: Record<string, unknown>;
}

export interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  relationships: KnowledgeRelationship[];
}

export interface QueryRequest {
  query: string;
  type: 'natural_language' | 'cypher';
}

export interface QueryResponse {
  success: boolean;
  data?: KnowledgeGraph;
  message?: string;
  error?: string;
}