import { SocketHandler } from "../../backendTypes";
import { getFeaturedGraphs } from "../../db/operations/graphOperations";
import { GraphData } from "../../.shared/types";

interface GetFeaturedGraphsResponse {
  graphs: GraphData[]
}

export const handleGetFeaturedGraphs: SocketHandler<{}, GetFeaturedGraphsResponse> = async (socket, io, { }) => {
  const graphs = await getFeaturedGraphs();
  return {
    success: true,
    data: { graphs }
  };
}