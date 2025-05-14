import { generateGraphId } from '../idGenerator';
import { Argument, Edge, Graph, GraphData, User } from '../../.shared/types';
import { getArgumentScores } from '../../analysis/argumentScoreHandler';
import { getReactionCounts, getUserReactionsByGraphId } from './reactionOperations';
import { getTimestamp } from '../getTimestamp';
import { DbGraph } from '../dbTypes';
import { query, queryMany, queryOne } from '../db';
import { memoryCache, withCache } from '../../services/cacheService';
import { getArgumentsByGraphId } from './argumentOperations';
import { getEdgesByGraphId } from './edgeOperations';
import { isGraphPrivate, isEmailWhitelisted } from './privateGraphOperations';

/*
  Cached functions
*/

const FEATURED_GRAPH_IDS = [
  "gra_m47bz12vUA7fMZ",
  "gra_m70qer53Jq5Emj",
  "gra_m70qp33sYzJjAh",
  "gra_m70qyyo5brMidW"
]

export async function getFeaturedGraphs(): Promise<GraphData[]> {
  const cacheKey = `featured-graphs`;

  return withCache(
    cacheKey,
    60 * 60 * 1000, // 1 hour cache
    () => getGraphDataFromDb(FEATURED_GRAPH_IDS)
  );
}

export async function getUserGraphs(userId: string): Promise<GraphData[]> {
  const cacheKey = `user-graphs:${userId}`;

  return withCache(
    cacheKey,
    60 * 60 * 1000, // 1 hour cache
    async () => {
      const graphIdsResult = await query(
        `SELECT DISTINCT g.id
         FROM graphs g
         LEFT JOIN arguments a ON g.id = a.graph_id
         LEFT JOIN reactions r ON g.id = (
           SELECT graph_id
           FROM arguments
           WHERE id = r.argument_id
         )
         WHERE g.author_id = $1
            OR a.author_id = $1
            OR r.user_id = $1`,
        [userId]
      );

      return getGraphDataFromDb(graphIdsResult.rows.map(row => row.id));
    }
  );
}

export async function getGraphName(graphId: string): Promise<string> {
  const cacheKey = `graph-name:${graphId}`;

  return withCache(
    cacheKey,
    60 * 60 * 1000, // 1 hour cache
    async () => {
      const result = await query('SELECT name FROM graphs WHERE id = $1', [graphId]);
      return result.rows[0]?.name;
    }
  );
}

export async function getFullGraph(graphId: string, user?: User): Promise<Graph> {
  console.log(`Getting full graph ${graphId} for user ${user?.id}`);
  const startTime = performance.now();

  // Check if graph is private
  const isPrivate = await isGraphPrivate(graphId);
  if (isPrivate) {
    if (!user?.email) {
      throw new Error('Authentication required to access private graph');
    }
    if (user?.role !== 'admin') {
      const isWhitelisted = await isEmailWhitelisted(graphId, user.email);
      if (!isWhitelisted) {
        throw new Error('Access denied to private graph');
      }
    }
  }

  const [
    name,
    argumentsResult,
    edgesResult,
    reactionCounts,
    argumentScores,
    userReactionsResult
  ] = await Promise.all([
    getGraphName(graphId),
    getArgumentsByGraphId(graphId),
    getEdgesByGraphId(graphId),
    getReactionCounts(graphId),
    getArgumentScores(graphId),
    user?.id ? getUserReactionsByGraphId(user.id, graphId) : Promise.resolve([])
  ]);

  if (!name) {
    throw new Error('Graph not found');
  }

  const userReactionsMap = new Map(
    userReactionsResult.reduce((acc: [string, Record<string, boolean>][], row: { argument_id: string, type: string }) => {
      const existing = acc.find(([id]) => id === row.argument_id);
      if (existing) {
        existing[1][row.type] = true;
      } else {
        acc.push([row.argument_id, { [row.type]: true }]);
      }
      return acc;
    }, [])
  );

  const args: Argument[] = argumentsResult.map((row: { id: string; graph_id: string; statement: string; embedding: number[], author_id: string }) => ({
    id: row.id,
    graphId: row.graph_id,
    statement: row.statement,
    embedding: row.embedding,
    authorId: row.author_id,
    reactionCounts: reactionCounts.get(row.id) || { agree: 0, disagree: 0, unclear: 0 },
    score: argumentScores.get(row.id),
    userReaction: userReactionsMap.get(row.id) || undefined
  }));

  const edges: Edge[] = edgesResult.map((row: { id: string; graph_id: string; source_id: string; target_id: string }) => ({
    id: row.id,
    graphId: row.graph_id,
    sourceId: row.source_id,
    targetId: row.target_id
  }));

  const endTime = performance.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  console.log(`Loaded graph "${name}" (${graphId}) for user ${user?.id || 'anonymous'} in ${duration}s`);

  return {
    id: graphId,
    name,
    arguments: args,
    edges,
    isPrivate
  } as Graph;
}

/*
  Heavy functions, meant to be used from cached or rarely used functions
*/

async function getGraphDataFromDb(graphIds: string[]): Promise<GraphData[]> {
  const placeholders = graphIds.map((_, i) => `$${i + 1}`).join(',');
  const result = await query(
    `SELECT g.id, g.name,
      COUNT(DISTINCT a.id) as argument_count,
      COUNT(r.id) as reaction_count,
      GREATEST(MAX(a.id), MAX(r.id)) as latest_activity,
      CASE WHEN pg.graph_id IS NOT NULL THEN true ELSE false END as is_private
     FROM graphs g
     LEFT JOIN arguments a ON g.id = a.graph_id
     LEFT JOIN reactions r ON a.id = r.argument_id
     LEFT JOIN private_graphs pg ON g.id = pg.graph_id
     WHERE g.id IN (${placeholders})
     GROUP BY g.id, g.name, pg.graph_id
     ORDER BY GREATEST(MAX(a.id), MAX(r.id)) DESC NULLS FIRST`,
    graphIds
  );

  if (result.rows.length === 0) {
    throw new Error('Graphs not found');
  }

  return result.rows.map((row): GraphData => ({
    id: row.id,
    name: row.name,
    argumentCount: parseInt(row.argument_count, 10),
    reactionCount: parseInt(row.reaction_count, 10),
    lastActivity: row.latest_activity ? getTimestamp(row.latest_activity) : undefined,
    isPrivate: row.is_private
  }));
}

export async function getGraphsFromDb(graphIds: string[]): Promise<DbGraph[]> {
  const placeholders = graphIds.map((_, i) => `$${i + 1}`).join(',');
  return await queryMany<DbGraph>(
    `SELECT * FROM graphs WHERE id IN (${placeholders})`,
    graphIds
  );
}

export async function getAllGraphsFromDb(): Promise<DbGraph[]> {
  return await queryMany<DbGraph>('SELECT * FROM graphs ORDER BY name');
}

export async function createGraph(name: string, authorId: string): Promise<string> {
  const id = generateGraphId();
  await queryOne(
    'INSERT INTO graphs (id, name, author_id) VALUES ($1, $2, $3)',
    [id, name, authorId]
  );

  const cacheKeyPattern = `user-graphs:${authorId}`;
  memoryCache.deletePattern(cacheKeyPattern);

  return id;
}
