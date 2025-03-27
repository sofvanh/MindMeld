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
    getFullGraph(graphId),
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
    .map(arg => ({
      ...arg,
      combinedScore: (arg.score?.consensus ?? 0) * (arg.score?.fragmentation ?? 0)
    }))
    .filter(arg => arg.combinedScore > 0.1 && (arg.score?.clarity ?? 0) >= 0.5)
    .sort((a, b) => b.combinedScore - a.combinedScore)
    .slice(0, 5)
    .map(({ combinedScore, ...arg }) => arg); // Remove the combinedScore before returning

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
