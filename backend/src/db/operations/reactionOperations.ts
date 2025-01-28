import { query, queryMany, transaction } from '../db';
import { generateReactionId } from '../idGenerator';
import { ReactionCounts, UserReaction } from '../../.shared/types';
import { DbReaction } from '../dbTypes';

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

export interface ReactionForAnalysis {
  reactions: {
    userId: string;
    argumentId: string;
    voteValue: number;
    unclearValue: number;
  }[];
}

export async function getReactionsForAnalysis(
  graphId: string
): Promise<ReactionForAnalysis> {
  const result = await query(
    `WITH filtered_users AS (
      SELECT user_id
      FROM reactions r
      JOIN arguments a ON r.argument_id = a.id
      WHERE a.graph_id = $1
        AND r.type IN ('agree', 'disagree')
      GROUP BY user_id
      HAVING COUNT(*) >= 3
    ),
    reaction_matrices AS (
      SELECT
        r.user_id,
        r.argument_id,
        CASE
          WHEN r.type = 'agree' THEN 1
          WHEN r.type = 'disagree' THEN -1
          ELSE 0
        END as vote_value,
        CASE WHEN r.type = 'unclear' THEN 1 ELSE 0 END as unclear_value
      FROM reactions r
      JOIN arguments a ON r.argument_id = a.id
      JOIN filtered_users fu ON r.user_id = fu.user_id
      WHERE a.graph_id = $1
    )
    SELECT
      user_id,
      argument_id,
      vote_value,
      unclear_value
    FROM reaction_matrices
    ORDER BY user_id, argument_id`,
    [graphId]
  );

  return {
    reactions: result.rows.map(row => ({
      userId: row.user_id,
      argumentId: row.argument_id,
      voteValue: row.vote_value,
      unclearValue: row.unclear_value
    }))
  };
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
  reactionCountsResult.rows.forEach((row) => {
    reactionCounts[row.type as keyof ReactionCounts] = parseInt(row.count as string);
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
  userReactionResult.rows.forEach((row) => {
    userReaction[row.type as keyof UserReaction] = true;
  });

  return userReaction;
}

export async function getSpecificUserArgumentReactions(
  userArgumentPairs: { userId: string; argumentId: string }[]
): Promise<DbReaction[]> {
  const values: string[] = [];
  const conditions: string[] = [];

  userArgumentPairs.forEach((pair, index) => {
    values.push(pair.userId, pair.argumentId);
    conditions.push(`(user_id = $${2 * index + 1} AND argument_id = $${2 * index + 2})`);
  });

  const result = await queryMany<DbReaction>(
    `SELECT *
     FROM reactions
     WHERE ${conditions.join(' OR ')}`,
    values
  );

  return result;
}

export async function addAndRemoveReactions(reactionsToAdd: { userId: string, argumentId: string, type: 'agree' | 'disagree' | 'unclear' }[], reactionIdsToRemove: string[]) {
  await transaction(async (client) => {
    // Delete existing reactions if any
    if (reactionIdsToRemove.length > 0) {
      const deletePlaceholders = reactionIdsToRemove.map((_, i) => `$${i + 1}`).join(',');
      await client.query(
        `DELETE FROM reactions WHERE id IN (${deletePlaceholders})`,
        reactionIdsToRemove
      );
    }

    // Insert new reactions if any
    if (reactionsToAdd.length > 0) {
      const valueGroups: string[] = [];
      const values: any[] = [];
      reactionsToAdd.forEach((reaction, index) => {
        const id = generateReactionId();
        values.push(id, reaction.userId, reaction.argumentId, reaction.type);
        valueGroups.push(`($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`);
      });

      await client.query(
        `INSERT INTO reactions (id, user_id, argument_id, type) VALUES ${valueGroups.join(',')}`,
        values
      );
    }
  });
}
