export interface User {
  id: string;
  googleId: string;
  email: string;
}

// Graph visualization types
export interface NodeData {
  id: string;
  name: string;
}

export interface ExtendedNodeData extends NodeData {
  color: string;
  argument: Argument;
}

export interface LinkData {
  source: NodeData;
  target: NodeData;
}

export interface ForceGraphData {
  nodes: NodeData[];
  links: LinkData[];
}

// Core data types
export interface Argument {
  id: string;
  graphId: string;
  statement: string;
  embedding: number[];
  authorId?: string;
  reactionCounts?: {
    agree: number;
    disagree: number;
    unclear: number;
  };
  userReaction?: {
    agree?: boolean;
    disagree?: boolean;
    unclear?: boolean;
  };
  score?: {
    consensus: number;
    fragmentation: number;
    clarity: number;
  };
}

export interface Edge {
  id: string;
  graphId: string;
  sourceId: string;
  targetId: string;
}

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
  type: 'agree' | 'disagree' | 'unclear';
}