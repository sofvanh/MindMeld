// Arguments are the nodes in the graph
export interface Argument {
  id: string;
  graphId: string;
  statement: string;
  embedding: number[];
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
  arguments: Argument[];
  edges: Edge[];
}
