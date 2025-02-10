import { analyzeReactions } from "./reactionAnalyzer";
import { Edge } from "../.shared/types";
import { cosineSimilarity } from "../utils/math";
import { getEdgesForAnalysis } from "../db/operations/edgeOperations";

export async function getEdgeScores(graphId: string): Promise<Map<Edge, number>> {
  /**
   * Calculate differences between vote profiles of two arguments connected by an edge
   */
  const {
    argumentIndexMap,
    votingMatrix,
    uniquenessMatrix,
  } = await analyzeReactions(graphId);

  const { edges } = await getEdgesForAnalysis(graphId);

  // Weight the voting matrix by the uniqueness matrix
  const weightedVotingMatrix = votingMatrix.map((row, i) =>
    row.map((value, j) => value * Math.sqrt(uniquenessMatrix[i][j]))
  );

  return new Map(edges.map(edge => {
    const sourceIndex = argumentIndexMap.get(edge.sourceId);
    const targetIndex = argumentIndexMap.get(edge.targetId);

    if (sourceIndex === undefined || targetIndex === undefined) {
      throw new Error(`Edge ${edge.sourceId}-${edge.targetId} not found in the voting matrix`);
    }

    const sourceVector = weightedVotingMatrix.map(row => row[sourceIndex]);
    const targetVector = weightedVotingMatrix.map(row => row[targetIndex]);

    // 0 means the vectors are fully similar, 1 means they are orthogonal
    const edgeScore = 1 - Math.abs(cosineSimilarity(sourceVector, targetVector));

    return [edge, edgeScore] as [Edge, number];
  }));
}
