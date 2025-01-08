import { SocketHandler } from "../../backendTypes";
import { generateTopKSimilarEdges } from "../../embeddingHandler";
import { addArgument } from "../../db/operations/argumentOperations";
import { getGraphDataWithUserReactions } from "../../db/operations/graphOperations";
import { embedText } from "../../embeddingHandler";
import { sendNewArgumentUpdate } from "../updateHandler";
import { updateGraphEdges } from "../../db/operations/edgeOperations";

interface AddArgumentData {
  graphId: string;
  statement: string;
}

export const handleAddArgument: SocketHandler<AddArgumentData, {}> = async (socket, io, { graphId, statement }) => {
  if (!socket.data.user) {
    return { success: false, error: 'Authentication required' };
  }

  const graph = await getGraphDataWithUserReactions(graphId, socket.data.user.id);
  if (!graph) {
    return { success: false, error: 'Graph not found' };
  }

  const embedding = (await embedText([statement]))[0];
  const id = await addArgument(graphId, statement, embedding, socket.data.user.id);
  const newArgument = { id, graphId, statement, embedding, authorId: socket.data.user.id };

  graph.arguments.push(newArgument);
  const newEdges = generateTopKSimilarEdges(graph);
  await updateGraphEdges(graphId, newEdges);

  sendNewArgumentUpdate(io, graphId, newArgument, newEdges);
  // TODO Make author 'agree' with their own argument
  return { success: true };
}