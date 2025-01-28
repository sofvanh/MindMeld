import { query, queryOne } from '../db';
import { generateUserId } from '../idGenerator';
import { DbUser } from '../dbTypes';

export async function findOrCreateUser(googleId: string, email: string): Promise<DbUser> {
  let user = await queryOne<DbUser>('SELECT * FROM users WHERE google_id = $1', [googleId]);
  if (user) return user;

  const id = generateUserId();
  const result = await queryOne<DbUser>('INSERT INTO users (id, google_id, email) VALUES ($1, $2, $3) RETURNING *', [id, googleId, email]);
  if (!result) throw new Error('Query to create user failed');
  return result;
}
