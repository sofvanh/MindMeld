export interface User {
  id: string;
  googleId: string;
  email: string;
}

// Arguments are the nodes in the graph
export interface Argument {
  id: string;
  graphId: string;
  statement: string;
  embedding: number[];
  authorId?: string;
  reactionCounts?: {
    agree: number;
    disagree: number;
  };
  userReaction?: 'agree' | 'disagree' | null;
}

// Edges are the connections between arguments
export interface Edge {
  id: string;
  graphId: string;
  sourceId: string;
  targetId: string;
}

// Graphs are the containers for arguments and edges
export interface Graph {
  id: string;
  name: string;
  authorId?: string;
  arguments: Argument[];
  edges: Edge[];
}

export interface Reaction {
  id: string;
  userId: string;
  argumentId: string;
  type: 'agree' | 'disagree';
}