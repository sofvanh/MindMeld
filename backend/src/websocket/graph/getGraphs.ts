import { SocketHandler } from "../../backendTypes";
import { getAllGraphsFromDb } from "../../db/operations/graphOperations";

interface GetGraphsResponse {
  graphs: { id: string, name: string }[]
}

export const handleGetGraphs: SocketHandler<{}, GetGraphsResponse> = async (socket, io, { }) => {
  const graphs = await getAllGraphsFromDb();
  return {
    success: true,
    data: { graphs }
  };
}
