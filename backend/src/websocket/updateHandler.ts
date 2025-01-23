import { Server, Socket } from "socket.io";
import { getArgumentScores } from "../analysis/argumentScoreHandler";
import { getReactionCountsForArgument, getUserReactionForArgument } from "../db/operations/reactionOperations";
import { Argument, Edge } from "../.shared/types";

export const sendNewArgumentsUpdate = async (
  io: Server,
  graphId: string,
  newArguments: Argument[],
  allGraphEdges: Edge[]
) => {
  io.to(graphId).emit('arguments added', { newArguments, allGraphEdges });
}

export const sendReactionUpdate = async (
  socket: Socket,
  io: Server,
  graphId: string,
  argumentId: string
) => {
  // Send new UserReaction state to the user who performed the action
  const userReaction = await getUserReactionForArgument(socket.data.user.id, argumentId);
  socket.emit('user reaction update', { argumentId, userReaction })
  // Send new ReactionCounts states to all users currently in the graph
  const reactionCounts = await getReactionCountsForArgument(argumentId);
  io.to(graphId).emit('argument reactions update', { argumentId, reactionCounts });
  // Send the new argument scores to all users currently in the graph
  // TODO Only send scores that changed
  const newScores = await getArgumentScores(graphId);
  // Convert Map to plain object before sending
  const scoresObject = Object.fromEntries(newScores);
  io.to(graphId).emit('graph scores update', scoresObject);
}