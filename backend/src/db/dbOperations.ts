import { query } from './db';
import { generateUserId, generateGraphId, generateArgumentId, generateEdgeId } from './idGenerator';
import { User, Argument, Edge, Graph } from '../.shared/types';

export async function findOrCreateUser(googleId: string, email: string): Promise<User> {
  let user = await query('SELECT * FROM users WHERE google_id = $1', [googleId]);
  if (user.rows[0]) return user.rows[0];

  const id = generateUserId();
  const result = await query('INSERT INTO users (id, google_id, email) VALUES ($1, $2, $3) RETURNING *', [id, googleId, email]);
  return result.rows[0];
}

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

export async function addArgument(
  graphId: string,
  statement: string,
  embedding: number[],
  authorId: string
): Promise<string> {
  const id = generateArgumentId();
  await query(
    'INSERT INTO arguments (id, graph_id, statement, embedding, author_id) VALUES ($1, $2, $3, $4, $5)',
    [id, graphId, statement, embedding, authorId]
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
  const currentEdges = new Set(currentEdgesResult.rows.map((row: { source_id: string; target_id: string }) => `${row.source_id}-${row.target_id}`));

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

  const edgesToRemove = currentEdgesResult.rows.filter((row: { source_id: string; target_id: string }) =>
    !newEdgesSet.has(`${row.source_id}-${row.target_id}`)
  );

  // Remove redundant edges
  if (edgesToRemove.length > 0) {
    const edgeIdsToRemove = edgesToRemove.map((row: { id: string }) => row.id);
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
