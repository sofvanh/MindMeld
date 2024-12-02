import { query } from "../db";
import { generateArgumentId } from "../idGenerator";

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

export async function getArgumentIdsByGraphId(graphId: string): Promise<string[]> {
  const result = await query('SELECT id FROM arguments WHERE graph_id = $1', [graphId]);
  return result.rows.map((row: any) => row.id);
}