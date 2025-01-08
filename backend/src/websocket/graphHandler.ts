import { Socket } from 'socket.io';


export const handleLeaveGraph = async (socket: Socket, graphId: string) => {
  console.log(`Socket ${socket.id} leaving graph ${graphId}`);
  socket.leave(graphId);
};