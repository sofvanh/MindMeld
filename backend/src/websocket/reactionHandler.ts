import { Socket } from 'socket.io';
import { addReaction, removeReaction } from '../db/operations/reactionOperations';
import { getGraphData } from '../db/operations/graphOperations';
import { query } from '../db/db';

export const handleAddReaction = async (
  socket: Socket,
  io: any,
  { argumentId, type }: { argumentId: string; type: 'agree' | 'disagree' | 'unclear' },
  callback?: Function
) => {
  if (!socket.data.user) {
    callback?.({ success: false, error: 'Authentication required' });
    return;
  }

  try {
    const id = await addReaction(socket.data.user.id, argumentId, type);
    const graphId = (await query('SELECT graph_id FROM arguments WHERE id = $1', [argumentId])).rows[0].graph_id;
    const updatedGraph = await getGraphData(graphId, socket.data.user.id);
    io.to(graphId).emit('graph update', updatedGraph);
    callback?.({ success: true, id });
  } catch (error) {
    console.error('Error adding reaction:', error);
    callback?.({ success: false, error: 'Failed to add reaction' });
  }
};

export const handleRemoveReaction = async (
  socket: Socket,
  io: any,
  { argumentId, type }: { argumentId: string; type: 'agree' | 'disagree' | 'unclear' },
  callback?: Function
) => {
  if (!socket.data.user) {
    callback?.({ success: false, error: 'Authentication required' });
    return;
  }

  try {
    await removeReaction(socket.data.user.id, argumentId, type);
    const graphId = (await query('SELECT graph_id FROM arguments WHERE id = $1', [argumentId])).rows[0].graph_id;
    const updatedGraph = await getGraphData(graphId, socket.data.user.id);
    io.to(graphId).emit('graph update', updatedGraph);
    callback?.({ success: true });
  } catch (error) {
    console.error('Error removing reaction:', error);
    callback?.({ success: false, error: 'Failed to remove reaction' });
  }
};