import { Analysis } from "../../.shared/types";
import { SocketHandler } from "../../backendTypes";
import { getArgumentsByGraphId } from "../../db/operations/argumentOperations";
import { getReactionsByGraphId } from "../../db/operations/reactionOperations";

interface getAnalysisData {
  graphId: string;
}

interface getAnalysisResponse {
  analysis: Analysis;
}

export const handleGetAnalysis: SocketHandler<getAnalysisData, getAnalysisResponse> = async (socket, io, { graphId }) => {

  const [
    statements,
    reactions
  ] = await Promise.all([
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

  const analysis: Analysis = {
    statementCount,
    reactionCount,
    contributorCount
  };

  return {
    success: true,
    data: {
      analysis
    }
  };
};
