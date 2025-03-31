import { query, queryMany } from '../db';
import { generateEdgeId } from '../idGenerator';
import { DbEdge } from '../dbTypes';
import { memoryCache, withCache } from '../../services/cacheService';


/*
  Cached functions
*/

/**
 * Gets edges for a single graph with caching.
 *
 * @param graphId - The ID of the graph to get edges for.
 * @returns Promise resolving to an array of DbEdge objects.
 */
export async function getEdgesByGraphId(
  graphId: string
): Promise<DbEdge[]> {
  const cacheKey = `graph:${graphId}:edges`;

  return withCache(
    cacheKey,
    60 * 60 * 1000, // 1 hour cache
    async () => {
      return queryMany<DbEdge>(
        'SELECT * FROM edges WHERE graph_id = $1',
        [graphId]
      );
    }
  );
}



export async function getEdgesFromDb(graphIds: string[]): Promise<DbEdge[]> {
  const placeholders = graphIds.map((_, i) => `$${i + 1}`).join(',');
  return await queryMany<DbEdge>(
    `SELECT * FROM edges WHERE graph_id IN (${placeholders})`,
    graphIds
  );
}

// TODO Rewrite updateGraphEdges so that it can handle many graphs at once
/**
 * Updates the edges of a graph in the database.
 *
 * Retrieves current edges, compares with new edges,
 * removes redundant edges, and adds new ones.
 * Uses efficient bulk operations.
 * Invalidate cache for the entire graph.
 *
 * @param graphId - The ID of the graph to update.
 * @param newEdges - Array of {sourceId, targetId} objects.
 * @returns Array of DbEdge objects representing the new edges in the graph.
 * @throws If database operations fail.
 */
export async function updateGraphEdges(graphId: string, newEdges: { sourceId: string, targetId: string }[]): Promise<DbEdge[]> {
  // Get current edges from the database
  const currentEdges = await getEdgesFromDb([graphId]);
  const currentEdgesSet = new Set(currentEdges.map(edge => `${edge.source_id}-${edge.target_id}`));

  // Identify edges to be added and removed
  const edgesToAdd: { sourceId: string, targetId: string }[] = [];
  const newEdgesSet = new Set<string>();

  for (const edge of newEdges) {
    const edgeKey = `${edge.sourceId}-${edge.targetId}`;
    if (!currentEdgesSet.has(edgeKey)) {
      edgesToAdd.push(edge);
    }
    newEdgesSet.add(edgeKey);
  }

  const edgesToRemove = currentEdges.filter(edge =>
    !newEdgesSet.has(`${edge.source_id}-${edge.target_id}`)
  );

  // Remove redundant edges
  if (edgesToRemove.length > 0) {
    const edgeIdsToRemove = edgesToRemove.map(edge => edge.id);
    await query('DELETE FROM edges WHERE id = ANY($1)', [edgeIdsToRemove]);
  }

  // Add new edges
  const newEdgeObjects: DbEdge[] = [];
  if (edgesToAdd.length > 0) {
    const edgeIds = edgesToAdd.map(() => generateEdgeId());
    const values = edgesToAdd.map((edge, i) =>
      `('${edgeIds[i]}', '${graphId}', '${edge.sourceId}', '${edge.targetId}')`
    ).join(', ');

    await query(`
      INSERT INTO edges (id, graph_id, source_id, target_id)
      VALUES ${values}
    `, []);

    // Create DbEdge objects for the newly added edges
    newEdgeObjects.push(...edgesToAdd.map((edge, i) => ({
      id: edgeIds[i],
      graph_id: graphId,
      source_id: edge.sourceId,
      target_id: edge.targetId
    })));
  }

  const cacheKeyPattern = `graph:${graphId}:edges`;
  memoryCache.deletePattern(cacheKeyPattern);

  // Return all edges in the graph after the update
  const remainingEdges = currentEdges
    .filter(edge => newEdgesSet.has(`${edge.source_id}-${edge.target_id}`));

  return [...remainingEdges, ...newEdgeObjects];
}
