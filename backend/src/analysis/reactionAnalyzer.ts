import { getReactionsForAnalysis } from "../db/operations/reactionOperations";
import { normalizedCosineSimilarityMatrix, computeAllSums } from "../utils/math";

export interface ReactionAnalysis {
  userIndexMap: Map<string, number>;
  argumentIndexMap: Map<string, number>;
  votingMatrix: number[][];
  unclearMatrix: number[][];
  uniquenessMatrix: number[][];
  sum_pos_pos: number[][];
  sum_pos_neg: number[][];
  sum_neg_pos: number[][];
  sum_neg_neg: number[][];
}

export async function analyzeReactions(graphId: string): Promise<ReactionAnalysis> {
  const { reactions } = await getReactionsForAnalysis(graphId);
  const userIndexMap = new Map<string, number>();
  const argumentIndexMap = new Map<string, number>();
  reactions.forEach(reaction => {
    if (!userIndexMap.has(reaction.userId)) {
      userIndexMap.set(reaction.userId, userIndexMap.size);
    }
    if (!argumentIndexMap.has(reaction.argumentId)) {
      argumentIndexMap.set(reaction.argumentId, argumentIndexMap.size);
    }
  });

  const userCount = userIndexMap.size;
  const argumentCount = argumentIndexMap.size;
  const votingMatrix = new Array(userCount).fill(0).map(() => new Array(argumentCount).fill(0));
  const unclearMatrix = new Array(userCount).fill(0).map(() => new Array(argumentCount).fill(0));
  for (const reaction of reactions) {
    const userIdx = userIndexMap.get(reaction.userId)!;
    const argumentIdx = argumentIndexMap.get(reaction.argumentId)!;
    if (reaction.voteValue !== 0) {
      votingMatrix[userIdx][argumentIdx] = reaction.voteValue;
    }
    if (reaction.unclearValue !== 0) {
      unclearMatrix[userIdx][argumentIdx] = reaction.unclearValue;
    }
  }

  const userSimilarityMatrix: number[][] = normalizedCosineSimilarityMatrix(votingMatrix);
  const { sum_pos_pos, sum_pos_neg, sum_neg_pos, sum_neg_neg } = computeAllSums(userSimilarityMatrix, votingMatrix);
  const uniquenessMatrix = votingMatrix.map((row, i) => row.map((value, j) => {
    const sumIngroupAgree = sum_pos_pos[i][j];
    const sumIngroupDisagree = sum_pos_neg[i][j];
    const sumIngroupNoVote = votingMatrix[i][j] === 0 ? 1 : 0;

    const sumIngroup = sumIngroupAgree + sumIngroupDisagree + sumIngroupNoVote;
    return 1 / sumIngroup;
  }));

  return {
    userIndexMap,
    argumentIndexMap,
    votingMatrix,
    unclearMatrix,
    uniquenessMatrix,
    sum_pos_pos,
    sum_pos_neg,
    sum_neg_pos,
    sum_neg_neg
  };
}
