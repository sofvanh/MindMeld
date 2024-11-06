import { query } from '../db';
import { generateGraphId } from '../idGenerator';
import { Argument, Edge, Graph } from '../../.shared/types';

export async function createGraph(name: string, authorId: string): Promise<string> {
  const id = generateGraphId();
  await query(
    'INSERT INTO graphs (id, name, author_id) VALUES ($1, $2, $3)',
    [id, name, authorId]
  );
  return id;
}

export async function getGraphs(): Promise<{ id: string; name: string }[]> {
  const result = await query('SELECT id, name FROM graphs ORDER BY name', []);
  return result.rows;
}

export async function getGraphData(graphId: string): Promise<Graph> {
  const graphResult = await query('SELECT * FROM graphs WHERE id = $1', [graphId]);
  if (graphResult.rows.length === 0) {
    throw new Error('Graph not found');
  }

  const argumentsResult = await query('SELECT * FROM arguments WHERE graph_id = $1', [graphId]);
  const edgesResult = await query('SELECT * FROM edges WHERE graph_id = $1', [graphId]);

  // TODO Create types for rows
  const args: Argument[] = argumentsResult.rows.map((row: { id: string; graph_id: string; statement: string; embedding: number[] }) => ({
    id: row.id,
    graphId: row.graph_id,
    statement: row.statement,
    embedding: row.embedding
  }));

  const links: Edge[] = edgesResult.rows.map((row: { id: string; graph_id: string; source_id: string; target_id: string }) => ({
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