import { query } from '../db';
import { generateReactionId } from '../idGenerator';

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