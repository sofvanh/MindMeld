import { SocketHandler } from "../../backendTypes";
import { getAllGraphData } from "../../db/operations/graphOperations";
import { GraphData } from "../../.shared/types";

interface GetGraphsResponse {
  graphs: GraphData[];
}

export const handleGetGraphs: SocketHandler<{}, GetGraphsResponse> = async (socket, io, { }) => {
  if (!socket.data.user || socket.data.user.role !== 'admin') {
    return {
      success: false,
      error: 'Admin privileges required'
    };
  }
  const graphs = await getAllGraphData();
  graphs.sort((a, b) => (b.lastActivity || 0) - (a.lastActivity || 0));
  return {
    success: true,
    data: { graphs }
  };
}
