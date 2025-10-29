export interface User {
  id: string;
  googleId: string;
  email: string;
  role?: string;
}

// Graph visualization types
export interface NodeData {
  id: string;
  name: string;
  clusterId?: number;
  type?: 'statement' | 'post';
  post?: Post;
}

export interface ExtendedNodeData extends NodeData {
  color: string;
  argument?: Argument;
  post?: Post;
}

export interface LinkData {
  source: NodeData;
  target: NodeData;
  type?: 'similarity' | 'post-statement';
  voteType?: 'agree' | 'disagree' | 'unclear';
}

export interface ForceGraphData {
  nodes: NodeData[];
  links: LinkData[];
}

// Core data types
export interface Post {
  uri: string;
  url: string;
  text?: string;
  authorId?: string;
}

export interface Argument {
  id: string;
  graphId: string;
  statement: string;
  embedding: number[];
  authorId?: string;
  reactionCounts?: ReactionCounts;
  userReaction?: UserReaction;
  score?: Score;
  sourcePosts?: Post[];
}

export interface ReactionCounts {
  agree: number;
  disagree: number;
  unclear: number;
}

export interface UserReaction {
  agree?: boolean;
  disagree?: boolean;
  unclear?: boolean;
}

export interface Score {
  consensus?: number;
  fragmentation?: number;
  clarity: number;
}

export interface Edge {
  id: string;
  graphId: string;
  sourceId: string;
  targetId: string;
}

export interface GraphData {
  id: string;
  name: string;
  argumentCount: number;
  reactionCount: number;
  lastActivity: number | undefined;
  isPrivate?: boolean;
}

export interface Graph {
  id: string;
  name: string;
  authorId?: string;
  arguments: Argument[];
  edges: Edge[];
  isPrivate: boolean;
}

export type ReactionType = 'agree' | 'disagree' | 'unclear';

export interface Reaction {
  id: string;
  userId: string;
  argumentId: string;
  type: ReactionType;
}

export interface ReactionAction {
  actionType: 'add' | 'remove';
  argumentId: string;
  reactionType: ReactionType;
}

export interface Analysis {
  statementCount: number;
  reactionCount: number;
  contributorCount: number;
  createdAt: string;
  topStatements: Argument[];
}
