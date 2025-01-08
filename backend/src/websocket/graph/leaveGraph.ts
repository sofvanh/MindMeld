import { SocketHandler } from "../../backendTypes";

interface LeaveGraphData {
  graphId: string;
}

export const handleLeaveGraph: SocketHandler<LeaveGraphData, {}> = async (socket, io, { graphId }) => {
  console.log(`Socket ${socket.id} leaving graph ${graphId}`);
  socket.leave(graphId);
  return { success: true };
}