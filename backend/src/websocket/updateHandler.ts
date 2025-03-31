import { Server, Socket } from "socket.io";
import { getArgumentScores } from "../analysis/argumentScoreHandler";
import { getReactionCounts } from "../db/operations/reactionOperations";
import { Argument, Edge, ReactionCounts, Score, UserReaction } from "../.shared/types";

export const sendNewArgumentsUpdate = async (
  io: Server,
  graphId: string,
  newArguments: Argument[],
  allGraphEdges: Edge[]
) => {
  io.to(graphId).emit('arguments added', { newArguments, allGraphEdges });
}

export const sendUserReactionsUpdate = async (
  socket: Socket,
  argumentIdToUserReaction: Map<string, UserReaction>
) => {
  const argumentIdToUserReactionRecord = Object.fromEntries(argumentIdToUserReaction);
  socket.emit('user reactions update', { argumentIdToUserReaction: argumentIdToUserReactionRecord });
}

export const sendGraphReactionsAndScoresUpdate = async (
  io: Server,
  graphId: string
) => {
  const reactionCounts: Map<string, ReactionCounts> = await getReactionCounts(graphId);
  const argumentScores: Map<string, Score> = await getArgumentScores(graphId);
  const graphReactionsRecord = Object.fromEntries(reactionCounts);
  const argumentScoresRecord = Object.fromEntries(argumentScores);
  io.to(graphId).emit('graph reactions and scores update', { graphReactions: graphReactionsRecord, argumentScores: argumentScoresRecord });
}
