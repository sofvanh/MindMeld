import { Pool } from 'pg';
import config from '../config';

const pool = new Pool({
  user: config.db.user,
  host: config.db.host,
  database: config.db.name,
  password: config.db.password,
  port: config.db.port,
  connectionTimeoutMillis: 5000,
});

// TODO Fix things here so that server doesn't crash on timeout errors (does it actually happen with new socket handler?)
export const query = (text: string, params: any[]) => pool.query(text, params);