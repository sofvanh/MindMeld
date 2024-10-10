import { query } from './db';
import { generateGraphId, generateArgumentId, generateEdgeId } from './idGenerator';
import { Argument, Edge, Graph } from '../.shared/types';

export async function createGraph(name: string): Promise<string> {
  const id = generateGraphId();
  await query('INSERT INTO graphs (id, name) VALUES ($1, $2)', [id, name]);
  return id;
}

export async function getGraphs(): Promise<{ id: string; name: string }[]> {
  const result = await query('SELECT id, name FROM graphs ORDER BY name', []);
  return result.rows;
}

export async function addArgument(graphId: string, statement: string, embedding: number[]): Promise<string> {
  const id = generateArgumentId();
  await query(
    'INSERT INTO arguments (id, graph_id, statement, embedding) VALUES ($1, $2, $3, $4)',
    [id, graphId, statement, embedding]
  );
  return id;
}

/**
 * Updates the edges of a graph in the database.
 * 
 * Retrieves current edges, compares with new edges,
 * removes redundant edges, and adds new ones.
 * Uses efficient bulk operations.
 * 
 * @param graphId - The ID of the graph to update.
 * @param newEdges - Array of new Edge objects.
 * @throws If database operations fail.
 */
export async function updateGraphEdges(graphId: string, newEdges: Edge[]): Promise<void> {
  // Get current edges from the database
  const currentEdgesResult = await query('SELECT id, source_id, target_id FROM edges WHERE graph_id = $1', [graphId]);
  const currentEdges = new Set(currentEdgesResult.rows.map(row => `${row.source_id}-${row.target_id}`));

  // Identify edges to be added and removed
  const edgesToAdd: Edge[] = [];
  const newEdgesSet = new Set<string>();

  for (const edge of newEdges) {
    const edgeKey = `${edge.sourceId}-${edge.targetId}`;
    if (!currentEdges.has(edgeKey)) {
      edgesToAdd.push(edge);
    }
    newEdgesSet.add(edgeKey);
  }

  const edgesToRemove = currentEdgesResult.rows.filter(row =>
    !newEdgesSet.has(`${row.source_id}-${row.target_id}`)
  );

  // Remove redundant edges
  if (edgesToRemove.length > 0) {
    const edgeIdsToRemove = edgesToRemove.map(row => row.id);
    await query('DELETE FROM edges WHERE id = ANY($1)', [edgeIdsToRemove]);
  }

  // Add new edges
  if (edgesToAdd.length > 0) {
    const values = edgesToAdd.map(edge =>
      `('${generateEdgeId()}', '${graphId}', '${edge.sourceId}', '${edge.targetId}')`
    ).join(', ');

    await query(`
      INSERT INTO edges (id, graph_id, source_id, target_id)
      VALUES ${values}
    `, []);
  }
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

// export async function updateArgument(argumentId: string, newStatement: string, newEmbedding: number[]): Promise<void> {
//   await query(
//     'UPDATE arguments SET statement = $1, embedding = $2 WHERE id = $3',
//     [newStatement, newEmbedding, argumentId]
//   );
// }