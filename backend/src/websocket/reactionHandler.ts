import { Socket } from 'socket.io';
import { addReaction, removeReaction } from '../db/operations/reactionOperations';
import { getGraphDataWithUserReactions } from '../db/operations/graphOperations';
import { query } from '../db/db';


// TODO When scores are updated, send only the changed scores

export const handleAddReaction = async (
  socket: Socket,
  io: any,
  { argumentId, type }: { argumentId: string; type: 'agree' | 'disagree' | 'unclear' },
  callback?: Function
) => {
  if (!socket.data.user) {
    console.log(`Failed to add reaction: No user data on socket. Argument ID: ${argumentId}, Type: ${type}, Socket ID: ${socket.id}`);
    callback?.({ success: false, error: 'Authentication required' });
    return;
  }

  try {
    const id = await addReaction(socket.data.user.id, argumentId, type);
    const graphId = (await query('SELECT graph_id FROM arguments WHERE id = $1', [argumentId])).rows[0].graph_id;
    const updatedGraph = await getGraphDataWithUserReactions(graphId, socket.data.user.id);
    io.to(graphId).emit('graph update', updatedGraph); // TODO This breaks, because we're sending the current user's score to all users in the graph!
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
    console.log(`Failed to remove reaction: No user data on socket. Argument ID: ${argumentId}, Type: ${type}, Socket ID: ${socket.id}`);
    callback?.({ success: false, error: 'Authentication required' });
    return;
  }

  try {
    await removeReaction(socket.data.user.id, argumentId, type);
    const graphId = (await query('SELECT graph_id FROM arguments WHERE id = $1', [argumentId])).rows[0].graph_id;
    const updatedGraph = await getGraphDataWithUserReactions(graphId, socket.data.user.id);
    io.to(graphId).emit('graph update', updatedGraph);
    callback?.({ success: true });
  } catch (error) {
    console.error('Error removing reaction:', error);
    callback?.({ success: false, error: 'Failed to remove reaction' });
  }
};