import { Socket } from 'socket.io';
import { getGraphDataWithUserReactions } from '../db/operations/graphOperations';

export const handleJoinGraph = async (socket: Socket, graphId: string) => {
  console.log(`Socket ${socket.id} joining graph ${graphId}, user: ${socket.data.user?.id}`);
  socket.join(graphId);
  const graph = await getGraphDataWithUserReactions(graphId, socket.data.user?.id);
  socket.emit('graph data', graph);
};

export const handleLeaveGraph = async (socket: Socket, graphId: string) => {
  console.log(`Socket ${socket.id} leaving graph ${graphId}`);
  socket.leave(graphId);
};