import { Argument } from "../../.shared/types";
import { query, queryMany } from "../db";
import { DbArgument } from "../dbTypes";
import { generateArgumentId } from "../idGenerator";
import { getReactionCountsForArgument } from "./reactionOperations";

export async function addArgument(
  graphId: string,
  statement: string,
  embedding: number[],
  authorId: string
): Promise<string> {
  const id = generateArgumentId();
  await query(
    'INSERT INTO arguments (id, graph_id, statement, embedding, author_id) VALUES ($1, $2, $3, $4, $5)',
    [id, graphId, statement, embedding, authorId]
  );
  return id;
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

  return dbArguments;
}

export async function getArgument(
  argumentId: string
): Promise<Argument | null> {
  const result = await query('SELECT * FROM arguments WHERE id = $1', [argumentId]);
  if (result.rows.length === 0) {
    return null;
  }

  const reactionCounts = await getReactionCountsForArgument(argumentId);

  const row = result.rows[0];
  return {
    id: row.id,
    graphId: row.graph_id,
    statement: row.statement,
    embedding: row.embedding,
    authorId: row.author_id,
    reactionCounts: reactionCounts
  };
}

export async function getArguments(graphIds: string[]): Promise<DbArgument[]> {
  return await queryMany<DbArgument>(
    `SELECT * FROM arguments WHERE graph_id = ANY($1)`,
    [graphIds]
  );
}

export async function getArgumentIdsByGraphId(graphId: string): Promise<string[]> {
  const result = await query('SELECT id FROM arguments WHERE graph_id = $1', [graphId]);
  return result.rows.map((row: any) => row.id);
}