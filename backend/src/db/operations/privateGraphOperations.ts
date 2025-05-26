import { queryOne, queryMany } from '../db';
import { DbPrivateGraph } from '../dbTypes';
import { withCache } from '../../services/cacheService';

/*
  Cached functions
*/

export async function isGraphPrivate(graphId: string): Promise<boolean> {
  const cacheKey = `graph:${graphId}:private`;

  return withCache(
    cacheKey,
    60 * 60 * 1000, // 1 hour cache
    async () => {
      const result = await queryOne<DbPrivateGraph>(
        'SELECT * FROM private_graphs WHERE graph_id = $1',
        [graphId]
      );
      return !!result;
    }
  );
}

export async function isEmailWhitelisted(graphId: string, email: string): Promise<boolean> {
  const cacheKey = `graph:${graphId}:whitelist:${email}`;

  return withCache(
    cacheKey,
    60 * 60 * 1000, // 1 hour cache
    async () => {
      const result = await queryOne<DbPrivateGraph>(
        'SELECT * FROM private_graphs WHERE graph_id = $1 AND $2 = ANY(whitelisted_emails)',
        [graphId, email]
      );
      return !!result;
    }
  );
}

/*
  Heavy functions, meant to be used from cached or rarely used functions
*/

export async function getPrivateGraphFromDb(graphId: string): Promise<DbPrivateGraph | null> {
  return await queryOne<DbPrivateGraph>(
    'SELECT * FROM private_graphs WHERE graph_id = $1',
    [graphId]
  );
}

export async function getPrivateGraphsFromDb(graphIds: string[]): Promise<DbPrivateGraph[]> {
  const placeholders = graphIds.map((_, i) => `$${i + 1}`).join(',');
  return await queryMany<DbPrivateGraph>(
    `SELECT * FROM private_graphs WHERE graph_id IN (${placeholders})`,
    graphIds
  );
}
