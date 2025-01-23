import { Pool, PoolClient, QueryResultRow } from 'pg';
import config from '../config';

const pool = new Pool({
  user: config.db.user,
  host: config.db.host,
  database: config.db.name,
  password: config.db.password,
  port: config.db.port,
  connectionTimeoutMillis: 5000,
});

// TODO: Make all DB operations use queryOne or queryMany and make this private
export const query = <T extends QueryResultRow>(
  text: string,
  params: any[] = []
) => pool.query<T>(text, params);

export const queryOne = async <T extends QueryResultRow>(
  text: string,
  params: any[] = []
): Promise<T | null> => {
  const result = await query<T>(text, params);
  return result.rows[0] || null;
};

export const queryMany = async <T extends QueryResultRow>(
  text: string,
  params: any[] = []
): Promise<T[]> => {
  const result = await query<T>(text, params);
  return result.rows;
};

export const transaction = async <T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};