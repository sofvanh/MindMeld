import { generateGraphId } from '../idGenerator';
import { Argument, Edge, Graph, GraphData } from '../../.shared/types';
import { getArgumentScores } from '../../analysis/argumentScoreHandler';
import { getReactionCountsFromDb } from './reactionOperations';
import { getTimestamp } from '../getTimestamp';
import { DbArgument, DbEdge, DbGraph, DbReaction } from '../dbTypes';
import { query, queryMany, queryOne } from '../db';
import { memoryCache, withCache } from '../../services/cacheService';


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


export async function getFullGraph(graphId: string, userId?: string): Promise<Graph> {
  const cacheKey = `graph:${graphId}${userId ? `:${userId}` : ''}`;
  console.log('cacheKey', cacheKey);

  return withCache(
    cacheKey,
    60 * 60 * 1000, // 1 hour cache
    () => getFullGraphFromDb(graphId, userId)
  );
}

/*
  Heavy functions, meant to be used from cached or rarely used functions
*/

async function getFullGraphFromDb(graphId: string, userId?: string): Promise<Graph> {
  const [
    { rows: [{ name }] },
    argumentsResult,
    edgesResult,
    reactionCounts,
    argumentScores,
    userReactionsResult
  ] = await Promise.all([
    query('SELECT name FROM graphs WHERE id = $1', [graphId]),
    queryMany<DbArgument>('SELECT * FROM arguments WHERE graph_id = $1', [graphId]),
    queryMany<DbEdge>('SELECT * FROM edges WHERE graph_id = $1', [graphId]),
    getReactionCountsFromDb(graphId),
    getArgumentScores(graphId),
    userId ? queryMany<DbReaction>(
      `SELECT *
      FROM reactions
      WHERE user_id = $1 AND argument_id IN (SELECT id FROM arguments WHERE graph_id = $2)`,
      [userId, graphId]
    ) : Promise.resolve([])
  ]);

  console.log('Finished queries');

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

  return {
    id: graphId,
    name,
    arguments: args,
    edges
  } as Graph;
}

async function getGraphDataFromDb(graphIds: string[]): Promise<GraphData[]> {
  const placeholders = graphIds.map((_, i) => `$${i + 1}`).join(',');
  const result = await query(
    `SELECT g.id, g.name,
      COUNT(a.id) as argument_count,
      MAX(a.id) as latest_argument_id
     FROM graphs g
     LEFT JOIN arguments a ON g.id = a.graph_id
     WHERE g.id IN (${placeholders})
     GROUP BY g.id, g.name`,
    graphIds
  );

  if (result.rows.length === 0) {
    throw new Error('Graphs not found');
  }

  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    argumentCount: parseInt(row.argument_count),
    lastActivity: row.latest_argument_id ? getTimestamp(row.latest_argument_id) : undefined
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
