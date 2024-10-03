import { query } from './db';
import { generateGraphId, generateArgumentId, generateEdgeId } from './idGenerator';
import { Argument, Edge, Graph } from '../.shared/types';

export async function createGraph(name: string): Promise<string> {
  const id = generateGraphId();
  await query('INSERT INTO graphs (id, name) VALUES ($1, $2)', [id, name]);
  return id;
}

export async function addArgument(graphId: string, statement: string, embedding: number[]): Promise<string> {
  const id = generateArgumentId();
  await query(
    'INSERT INTO arguments (id, graph_id, statement, embedding) VALUES ($1, $2, $3, $4)',
    [id, graphId, statement, embedding]
  );
  return id;
}

export async function createEdge(graphId: string, sourceId: string, targetId: string): Promise<string> {
  const id = generateEdgeId();
  await query(
    'INSERT INTO edges (id, graph_id, source_id, target_id) VALUES ($1, $2, $3, $4)',
    [id, graphId, sourceId, targetId]
  );
  return id;
}

export async function getGraphData(graphId: string): Promise<Graph> {
  const graphResult = await query('SELECT * FROM graphs WHERE id = $1', [graphId]);
  if (graphResult.rows.length === 0) {
    throw new Error('Graph not found');
  }

  const argumentsResult = await query('SELECT * FROM arguments WHERE graph_id = $1', [graphId]);
  const edgesResult = await query('SELECT * FROM edges WHERE graph_id = $1', [graphId]);

  const args: Argument[] = argumentsResult.rows.map(row => ({
    id: row.id,
    graphId: row.graph_id,
    statement: row.statement,
    embedding: row.embedding
  }));

  const links: Edge[] = edgesResult.rows.map(row => ({
    id: row.id,
    graphId: row.graph_id,
    sourceId: row.source_id,
    targetId: row.target_id
  }));

  return {
    id: graphId,
    name: graphResult.rows[0].name,
    arguments: args,
    edges: links
  } as Graph;
}

// export async function deleteEdge(edgeId: string): Promise<void> {
//   await query('DELETE FROM edges WHERE id = $1', [edgeId]);
// }

// export async function updateArgument(argumentId: string, newStatement: string, newEmbedding: number[]): Promise<void> {
//   await query(
//     'UPDATE arguments SET statement = $1, embedding = $2 WHERE id = $3',
//     [newStatement, newEmbedding, argumentId]
//   );
// }