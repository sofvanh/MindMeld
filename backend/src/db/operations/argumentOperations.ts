import { query, queryMany } from "../db";
import { DbArgument } from "../dbTypes";
import { generateArgumentId } from "../idGenerator";
import { memoryCache, withCache } from "../../services/cacheService";


/*
  Cached functions
*/

export async function getArgumentsByGraphId(graphId: string): Promise<DbArgument[]> {
  const cacheKey = `graph:${graphId}:arguments`;

  return withCache(
    cacheKey,
    60 * 60 * 1000, // 1 hour cache
    async () => {
      return queryMany<DbArgument>(
        'SELECT * FROM arguments WHERE graph_id = $1',
        [graphId]
      );
    }
  );
}

/*
  Heavy functions, meant to be used from cached or rarely used functions
*/

export async function getArgumentsForGraphsFromDb(graphIds: string[]): Promise<DbArgument[]> {
  return await queryMany<DbArgument>(
    `SELECT * FROM arguments WHERE graph_id = ANY($1)`,
    [graphIds]
  );
}

export async function addArguments(
  args: {
    graphId: string;
    statement: string;
    embedding: number[];
    authorId: string;
  }[]
): Promise<DbArgument[]> {
  const dbArguments = args.map(arg => ({
    id: generateArgumentId(),
    graph_id: arg.graphId,
    statement: arg.statement,
    embedding: arg.embedding,
    author_id: arg.authorId
  }));

  const values = dbArguments.map((_, i) => {
    const base = i * 5 + 1;
    return `($${base}, $${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`;
  }).join(',');

  const flatParams = dbArguments.flatMap(arg => [
    arg.id, arg.graph_id, arg.statement, arg.embedding, arg.author_id
  ]);

  await query(
    `INSERT INTO arguments (id, graph_id, statement, embedding, author_id) VALUES ${values}`,
    flatParams
  );

  const graphIds = [...new Set(args.map(arg => arg.graphId))];
  const cacheKeyPattern = `graph:(${graphIds.join('|')}):arguments`;
  memoryCache.deletePattern(cacheKeyPattern);

  return dbArguments;
}
