import { Graph } from "../../.shared/types";
import { SocketHandler } from "../../backendTypes";
import { getFullGraphWithUserReactions } from "../../db/operations/graphOperations";
import { withCache } from "../../services/cacheService";

interface JoinGraphData {
  graphId: string;
}

interface JoinGraphResponse {
  graph: Graph;
}

export const handleJoinGraph: SocketHandler<JoinGraphData, JoinGraphResponse> = async (socket, io, { graphId }) => {
  socket.join(graphId);
  console.log(`Socket ${socket.id} joining graph ${graphId}`);

  const cacheKey = `graph:${graphId}:${socket.data.user?.id || 'anonymous'}`;
  const graph = await withCache(
    cacheKey,
    60 * 60 * 1000,
    () => getFullGraphWithUserReactions(graphId, socket.data.user?.id)
  );

  return {
    success: true,
    data: { graph }
  };
};
