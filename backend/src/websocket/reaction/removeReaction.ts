import { SocketHandler } from "../../backendTypes";
import { query } from "../../db/db";
import { removeReaction } from "../../db/operations/reactionOperations";
import { sendReactionUpdate } from "../updateHandler";

export interface RemoveReactionData {
  argumentId: string;
  type: 'agree' | 'disagree' | 'unclear';
}

export const handleRemoveReaction: SocketHandler<RemoveReactionData, {}> = async (socket, io, { argumentId, type }) => {
  if (!socket.data.user) {
    return { success: false, error: 'Authentication required' };
  }

  await removeReaction(socket.data.user.id, argumentId, type);
  const graphId = (await query('SELECT graph_id FROM arguments WHERE id = $1', [argumentId])).rows[0].graph_id;
  sendReactionUpdate(socket, io, graphId, argumentId);
  return { success: true };
}
