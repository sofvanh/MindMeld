import { Socket } from 'socket.io';
import { createGraph, getGraphs, getGraphDataWithUserReactions } from '../db/operations/graphOperations';

export const handleCreateGraph = async (socket: Socket, name: string, callback?: Function) => {
  if (!socket.data.user) {
    callback?.({ success: false, error: 'Authentication required' });
    return;
  }

  try {
    const graphId = await createGraph(name, socket.data.user.id);
    callback?.({ success: true, id: graphId });
  } catch (error) {
    console.error('Error creating graph:', error);
    callback?.({ success: false, error: 'Failed to create graph' });
  }
};

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