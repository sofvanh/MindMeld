import { SocketHandler } from "../../backendTypes";
import { getUserGraphs } from "../../db/operations/graphOperations";
import { Graph } from "../../.shared/types";

interface GetMyGraphsResponse {
  graphs: Graph[]
}

export const handleGetMyGraphs: SocketHandler<{}, GetMyGraphsResponse> = async (socket, io, { }) => {
  if (!socket.data.user) {
    return {
      success: false,
      error: 'Authentication required'
    };
  }
  const graphs = await getUserGraphs(socket.data.user.id);
  return {
    success: true,
    data: { graphs }
  };
}