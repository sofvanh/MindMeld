import { Analysis } from "../../.shared/types";
import { SocketHandler } from "../../backendTypes";
import { parseCustomId } from "../../db/idGenerator";
import { getArgumentsByGraphId } from "../../db/operations/argumentOperations";
import { getFullGraph } from "../../db/operations/graphOperations";
import { getReactionsByGraphId } from "../../db/operations/reactionOperations";

interface getAnalysisData {
  graphId: string;
}

interface getAnalysisResponse {
  analysis: Analysis;
}

export const handleGetAnalysis: SocketHandler<getAnalysisData, getAnalysisResponse> = async (socket, io, { graphId }) => {

  const [
    graph,
    statements,
    reactions
  ] = await Promise.all([
    getFullGraph(graphId, socket.data.user?.id, socket.data.user?.email),
    getArgumentsByGraphId(graphId),
    getReactionsByGraphId(graphId)
  ])

  const statementCount = statements.length;
  const reactionCount = reactions.length;
  const contributorIds = new Set([
    ...reactions.map(reaction => reaction.user_id),
    ...statements.map(statement => statement.author_id)
  ]);
  const contributorCount = contributorIds.size;

  const { timestamp } = parseCustomId(graph.id);

  const topStatements = graph.arguments
    .map(arg => {
      const reactionCount = reactions.filter(reaction => reaction.argument_id === arg.id).length;
      const consensus = arg.score?.consensus ?? 0;
      const fragmentation = arg.score?.fragmentation ?? 0;
      const clarity = arg.score?.clarity ?? 1;
      const logReactionCount = Math.log(Math.max(1, reactionCount));
      const importance = (consensus + 1) * (fragmentation + 1) * clarity * logReactionCount;

      return {
        ...arg,
        importance
      };
    })
    .filter(arg => arg.importance > 0.1)
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 20)
    .map(({ importance, ...arg }) => arg); // Remove the importance before returning

  const analysis: Analysis = {
    statementCount,
    reactionCount,
    contributorCount,
    createdAt: timestamp,
    topStatements
  };

  return {
    success: true,
    data: {
      analysis
    }
  };
};
