import { query } from '../db';
import { generateUserId } from '../idGenerator';
import { User } from '../../.shared/types';

export async function findOrCreateUser(googleId: string, email: string): Promise<User> {
  let user = await query('SELECT * FROM users WHERE google_id = $1', [googleId]);
  if (user.rows[0]) return user.rows[0];

  const id = generateUserId();
  const result = await query('INSERT INTO users (id, google_id, email) VALUES ($1, $2, $3) RETURNING *', [id, googleId, email]);
  return result.rows[0];
}