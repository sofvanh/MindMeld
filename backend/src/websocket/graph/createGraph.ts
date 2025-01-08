import { SocketHandler } from "../../backendTypes";
import { createGraph } from "../../db/operations/graphOperations";

interface CreateGraphData {
  name: string;
}

interface CreateGraphResponse {
  id: string;
}

export const handleCreateGraph: SocketHandler<CreateGraphData, CreateGraphResponse> = async (socket, io, { name }) => {
  if (!socket.data.user) {
    return {
      success: false,
      error: 'Authentication required'
    }
  }

  const graphId = await createGraph(name, socket.data.user.id);
  return {
    success: true,
    data: { id: graphId }
  }
}