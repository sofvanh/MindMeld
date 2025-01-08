import { SocketHandler } from "../../backendTypes";
import { getGraphs } from "../../db/operations/graphOperations";

interface GetGraphsResponse {
  graphs: { id: string, name: string }[]
}

export const handleGetGraphs: SocketHandler<{}, GetGraphsResponse> = async (socket, io, { }) => {
  const graphs = await getGraphs();
  return {
    success: true,
    data: { graphs }
  };
}