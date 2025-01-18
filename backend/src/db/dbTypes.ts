export interface DbUser {
  id: string;
  google_id: string;
  email: string;
}

export interface DbGraph {
  id: string;
  name: string;
  author_id: string;
}

export interface DbArgument {
  id: string;
  graph_id: string;
  statement: string;
  embedding: number[];
  author_id: string;
}

export interface DbEdge {
  id: string;
  graph_id: string;
  source_id: string;
  target_id: string;
}

export interface DbReaction {
  id: string;
  user_id: string;
  argument_id: string;
  type: string;
}

export interface DbArgumentStats {
  argument_count: string; // PostgreSQL COUNT returns string
  latest_argument_id: string | null;
}

export interface DbReactionCount {
  argument_id: string;
  type: string;
  count: string; // PostgreSQL COUNT returns string
}