import { generateGraphId } from '../idGenerator';
import { Argument, Edge, Graph, GraphData } from '../../.shared/types';
import { getArgumentScores } from '../../analysis/argumentScoreHandler';
import { getReactionCounts } from './reactionOperations';
import { getTimestamp } from '../getTimestamp';
import { DbArgument, DbEdge, DbGraph, DbReaction } from '../dbTypes';
import { query, queryMany, queryOne } from '../db';

export async function createGraph(name: string, authorId: string): Promise<string> {
  const id = generateGraphId();
  await queryOne(
    'INSERT INTO graphs (id, name, author_id) VALUES ($1, $2, $3)',
    [id, name, authorId]
  );
  return id;
}

export async function getGraphs(graphIds: string[]): Promise<DbGraph[]> {
  const placeholders = graphIds.map((_, i) => `$${i + 1}`).join(',');
  return await queryMany<DbGraph>(
    `SELECT * FROM graphs WHERE id IN (${placeholders})`,
    graphIds
  );
}

export async function getAllGraphs(): Promise<DbGraph[]> {
  return await queryMany<DbGraph>('SELECT * FROM graphs ORDER BY name');
}

export async function getFeaturedGraphs(userId?: string): Promise<GraphData[]> {
  const FEATURED_GRAPH_IDS = [
    "gra_m47bz12vUA7fMZ",
    "gra_m70qer53Jq5Emj",
    "gra_m70qp33sYzJjAh",
    "gra_m70qyyo5brMidW"
  ]
  return await getGraphData(FEATURED_GRAPH_IDS, userId);
}

export async function getUserGraphs(userId: string): Promise<GraphData[]> {
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

  return await getGraphData(graphIdsResult.rows.map(row => row.id), userId);
}

export async function getGraphData(graphIds: string[], userId?: string): Promise<GraphData[]> {
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

export async function getFullGraph(graphId: string): Promise<Graph> {
  const graphResult = await query('SELECT * FROM graphs WHERE id = $1', [graphId]);
  if (graphResult.rows.length === 0) {
    throw new Error('Graph not found');
  }

  const argumentsResult = await queryMany<DbArgument>('SELECT * FROM arguments WHERE graph_id = $1', [graphId]);
  const edgesResult = await queryMany<DbEdge>('SELECT * FROM edges WHERE graph_id = $1', [graphId]);
  const reactionCounts = await getReactionCounts(graphId);
  const argumentScores = await getArgumentScores(graphId);

  const args: Argument[] = argumentsResult.map(argument => ({
    id: argument.id,
    graphId: argument.graph_id,
    statement: argument.statement,
    embedding: argument.embedding,
    authorId: argument.author_id,
    reactionCounts: reactionCounts.get(argument.id) || { agree: 0, disagree: 0, unclear: 0 },
    score: argumentScores.get(argument.id)
  }));

  const links: Edge[] = edgesResult.map(edge => ({
    id: edge.id,
    graphId: edge.graph_id,
    sourceId: edge.source_id,
    targetId: edge.target_id
  }));

  return {
    id: graphId,
    name: graphResult.rows[0].name,
    arguments: args,
    edges: links
  } as Graph;
}

export async function getFullGraphWithUserReactions(graphId: string, userId: string): Promise<Graph> {
  const [
    { rows: [{ name }] },
    argumentsResult,
    edgesResult,
    userReactionsResult,
    reactionCounts,
    argumentScores
  ] = await Promise.all([
    query('SELECT name FROM graphs WHERE id = $1', [graphId]),
    queryMany<DbArgument>('SELECT * FROM arguments WHERE graph_id = $1', [graphId]),
    queryMany<DbEdge>('SELECT * FROM edges WHERE graph_id = $1', [graphId]),
    queryMany<DbReaction>(
      `SELECT *
       FROM reactions
       WHERE user_id = $1 AND argument_id IN (SELECT id FROM arguments WHERE graph_id = $2)`,
      [userId, graphId]
    ),
    getReactionCounts(graphId),
    getArgumentScores(graphId)
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
    userReaction: userReactionsMap.get(row.id) || {}
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
