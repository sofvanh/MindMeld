import { query } from '../db';
import { generateGraphId } from '../idGenerator';
import { Argument, Edge, Graph } from '../../.shared/types';
import { getArgumentScores } from '../../analysis/argumentScoreHandler';
import { getReactionCounts } from './reactionOperations';

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

export async function getFeaturedGraphs(): Promise<Graph[]> {
  const FEATURED_GRAPH_IDS = [
    "gra_m47bz12vUA7fMZ",
    "gra_m4a9lakjDPG7vU",
    "gra_m4abp2spuJ9yW5"
  ]
  const graphs = await Promise.all(FEATURED_GRAPH_IDS.map(id => getGraphData(id)));
  return graphs;
}


// TODO This is incredibly slow!
export async function getUserGraphs(userId: string): Promise<Graph[]> {
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

  const graphs: Graph[] = [];
  for (const row of graphIdsResult.rows) {
    const graphData = await getGraphData(row.id);
    graphs.push(graphData);
  }

  return graphs;
}



export async function getGraphData(graphId: string): Promise<Graph> {
  const graphResult = await query('SELECT * FROM graphs WHERE id = $1', [graphId]);
  if (graphResult.rows.length === 0) {
    throw new Error('Graph not found');
  }

  const argumentsResult = await query('SELECT * FROM arguments WHERE graph_id = $1', [graphId]);
  const edgesResult = await query('SELECT * FROM edges WHERE graph_id = $1', [graphId]);
  const reactionCounts = await getReactionCounts(graphId);
  const argumentScores = await getArgumentScores(graphId);

  // TODO This is terrible, create types for db results already...
  const args: Argument[] = argumentsResult.rows.map((row: { id: string; graph_id: string; statement: string; embedding: number[], author_id: string }) => ({
    id: row.id,
    graphId: row.graph_id,
    statement: row.statement,
    embedding: row.embedding,
    authorId: row.author_id,
    reactionCounts: reactionCounts.get(row.id) || { agree: 0, disagree: 0, unclear: 0 },
    score: argumentScores.get(row.id)
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

export async function getGraphDataWithUserReactions(graphId: string, userId: string): Promise<Graph> {
  const graphData = await getGraphData(graphId);
  let userReactionsMap = new Map();
  const userReactionsResult = await query(
    `SELECT argument_id, type
       FROM reactions 
       WHERE user_id = $1 AND argument_id IN (SELECT id FROM arguments WHERE graph_id = $2)`,
    [userId, graphId]
  );
  userReactionsResult.rows.forEach((row: any) => {
    if (!userReactionsMap.has(row.argument_id)) {
      userReactionsMap.set(row.argument_id, {});
    }
    userReactionsMap.get(row.argument_id)[row.type] = true;
  });

  const argsWithUserReactions = graphData.arguments.map(arg => ({
    ...arg,
    userReaction: userReactionsMap.get(arg.id) || {} // TODO I also want typing of the user reaction
  }));

  return {
    id: graphId,
    name: graphData.name,
    arguments: argsWithUserReactions,
    edges: graphData.edges
  } as Graph;
}