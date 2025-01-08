import { Graph } from "../../.shared/types";
import { SocketHandler } from "../../backendTypes";
import { getGraphDataWithUserReactions } from "../../db/operations/graphOperations";

interface JoinGraphData {
  graphId: string;
}

interface JoinGraphResponse {
  graph: Graph;
}

export const handleJoinGraph: SocketHandler<JoinGraphData, JoinGraphResponse> = async (socket, io, { graphId }) => {
  socket.join(graphId);
  console.log(`Socket ${socket.id} joining graph ${graphId}`);
  const graph = await getGraphDataWithUserReactions(graphId, socket.data.user?.id);
  return {
    success: true,
    data: { graph }
  }
}