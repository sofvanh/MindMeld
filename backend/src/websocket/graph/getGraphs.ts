import { SocketHandler } from "../../backendTypes";
import { getAllGraphsFromDb } from "../../db/operations/graphOperations";

interface GetGraphsResponse {
  graphs: { id: string, name: string }[]
}

export const handleGetGraphs: SocketHandler<{}, GetGraphsResponse> = async (socket, io, { }) => {
  if (!socket.data.user || socket.data.user.role !== 'admin') {
    return {
      success: false,
      error: 'Admin privileges required'
    };
  }
  const graphs = await getAllGraphsFromDb();
  return {
    success: true,
    data: { graphs }
  };
}
