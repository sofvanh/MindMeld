import { SocketHandler } from "../../backendTypes";
import { getAllGraphs } from "../../db/operations/graphOperations";

interface GetGraphsResponse {
  graphs: { id: string, name: string }[]
}

export const handleGetGraphs: SocketHandler<{}, GetGraphsResponse> = async (socket, io, { }) => {
  const graphs = await getAllGraphs();
  return {
    success: true,
    data: { graphs }
  };
}