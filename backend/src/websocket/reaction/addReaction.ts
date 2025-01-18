import { SocketHandler } from "../../backendTypes";
import { query } from "../../db/db";
import { addReaction } from "../../db/operations/reactionOperations";
import { sendReactionUpdate } from "../updateHandler";

export interface AddReactionData {
  argumentId: string;
  type: 'agree' | 'disagree' | 'unclear';
}

export const handleAddReaction: SocketHandler<AddReactionData, {}> = async (socket, io, { argumentId, type }) => {
  if (!socket.data.user) {
    return { success: false, error: 'Authentication required' };
  }

  await addReaction(socket.data.user.id, argumentId, type);
  const graphId = (await query('SELECT graph_id FROM arguments WHERE id = $1', [argumentId])).rows[0].graph_id;
  sendReactionUpdate(socket, io, graphId, argumentId);
  return { success: true };
}