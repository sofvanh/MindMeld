import { Argument } from "../../.shared/types";
import { query } from "../db";
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

export async function getArgumentIdsByGraphId(graphId: string): Promise<string[]> {
  const result = await query('SELECT id FROM arguments WHERE graph_id = $1', [graphId]);
  return result.rows.map((row: any) => row.id);
}