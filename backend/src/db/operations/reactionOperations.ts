import { query } from '../db';
import { generateReactionId } from '../idGenerator';
import { ReactionCounts, UserReaction } from '../../.shared/types';

export async function addReaction(
  userId: string,
  argumentId: string,
  type: 'agree' | 'disagree' | 'unclear'
): Promise<string> {
  const id = generateReactionId();

  // If adding agree/disagree, remove any existing agree/disagree reactions
  if (type === 'agree' || type === 'disagree') {
    await query(
      `DELETE FROM reactions 
       WHERE user_id = $1 
       AND argument_id = $2 
       AND type IN ('agree', 'disagree')`,
      [userId, argumentId]
    );
  }

  // Add the new reaction
  await query(
    'INSERT INTO reactions (id, user_id, argument_id, type) VALUES ($1, $2, $3, $4)',
    [id, userId, argumentId, type]
  );

  return id;
}

export async function removeReaction(
  userId: string,
  argumentId: string,
  type: string
): Promise<void> {
  await query(
    'DELETE FROM reactions WHERE user_id = $1 AND argument_id = $2 AND type = $3',
    [userId, argumentId, type]
  );
}

export interface ReactionForGraph {
  userId: string;
  argumentId: string;
  type: string;
}

export async function getReactionsForGraph(
  graphId: string
): Promise<ReactionForGraph[]> {
  const result = await query(
    `SELECT user_id, argument_id, type
     FROM reactions
     JOIN arguments ON reactions.argument_id = arguments.id
     WHERE arguments.graph_id = $1`,
    [graphId]
  );

  return result.rows.map((row: any) => ({
    userId: row.user_id,
    argumentId: row.argument_id,
    type: row.type
  }));
}

export async function getReactionCounts(
  graphId: string
): Promise<Map<string, ReactionCounts>> {
  const reactionCountsResult = await query(
    `SELECT argument_id, type, COUNT(*) as count
     FROM reactions 
     WHERE argument_id IN (SELECT id FROM arguments WHERE graph_id = $1)
     GROUP BY argument_id, type`,
    [graphId]
  );

  const reactionCountsMap = new Map();
  reactionCountsResult.rows.forEach((row: any) => {
    if (!reactionCountsMap.has(row.argument_id)) {
      reactionCountsMap.set(row.argument_id, { agree: 0, disagree: 0, unclear: 0 });
    }
    reactionCountsMap.get(row.argument_id)[row.type] = parseInt(row.count);
  });

  return reactionCountsMap;
}

export async function getReactionCountsForArgument(argumentId: string): Promise<ReactionCounts> {
  const reactionCountsResult = await query(
    `SELECT type, COUNT(*) as count
     FROM reactions 
     WHERE argument_id = $1
     GROUP BY type`,
    [argumentId]
  );

  const reactionCounts: ReactionCounts = { agree: 0, disagree: 0, unclear: 0 };
  reactionCountsResult.rows.forEach((row: { type: keyof ReactionCounts; count: string }) => {
    reactionCounts[row.type] = parseInt(row.count);
  });

  return reactionCounts;
}

export async function getUserReactionForArgument(userId: string, argumentId: string): Promise<UserReaction> {
  const userReactionResult = await query(
    `SELECT type
     FROM reactions 
     WHERE user_id = $1 AND argument_id = $2`,
    [userId, argumentId]
  );

  const userReaction: UserReaction = {};
  userReactionResult.rows.forEach((row: { type: keyof UserReaction }) => {
    userReaction[row.type] = true;
  });

  return userReaction;
}