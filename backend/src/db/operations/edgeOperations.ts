import { query } from '../db';
import { generateEdgeId } from '../idGenerator';
import { Edge } from '../../.shared/types';

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

