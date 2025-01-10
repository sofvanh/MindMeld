import { SocketHandler } from "../../backendTypes";
import { getFeaturedGraphs } from "../../db/operations/graphOperations";
import { Graph } from "../../.shared/types";

interface GetFeaturedGraphsResponse {
  graphs: Graph[]
}

export const handleGetFeaturedGraphs: SocketHandler<{}, GetFeaturedGraphsResponse> = async (socket, io, { }) => {
  const graphs = await getFeaturedGraphs();
  return {
    success: true,
    data: { graphs }
  };
}