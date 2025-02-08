import { Score } from "../.shared/types";
import { analyzeReactions } from "./reactionAnalyzer";

function getConsensusScore(argumentIndex: number,
  votingMatrix: number[][],
  sum_neg_pos: number[][],
  sum_neg_neg: number[][],
  uniquenessMatrix: number[][]) {
  /**
   * Average alignment with outgroup members
   */

  //Identify users who voted on this argument (agree/disagree)
  const usersWhoVoted = votingMatrix.map((row, i) =>
    row[argumentIndex] !== 0 ? i : null).filter(i => i !== null) as number[];

  // Filter for users with an outgroup
  const usersWithOutgroup = usersWhoVoted.filter(i =>
    sum_neg_pos[i][argumentIndex] + sum_neg_neg[i][argumentIndex] > 0);

  // If no users have an outgroup, can't calculate consensus
  if (usersWithOutgroup.length === 0) {
    return null;
  }

  // Compute individual user scores (to be aggregated as the final argument score later)
  const userConsensusScores = new Array(usersWithOutgroup.length).fill(0);

  for (let i = 0; i < usersWithOutgroup.length; i++) {
    const vote = votingMatrix[usersWithOutgroup[i]][argumentIndex];
    const sumOutgroupAgree = sum_neg_pos[usersWithOutgroup[i]][argumentIndex];
    const sumOutgroupDisagree = sum_neg_neg[usersWithOutgroup[i]][argumentIndex];
    const sumAlignedOutgroup = vote === 1 ? sumOutgroupAgree : sumOutgroupDisagree;

    userConsensusScores[i] = sumAlignedOutgroup / (sumOutgroupAgree + sumOutgroupDisagree);
  }

  // Average of user scores, weighted by uniqueness
  let consensusSum = 0;
  let uniquenessSum = 0;
  for (let i = 0; i < usersWithOutgroup.length; i++) {
    let uniqueness = uniquenessMatrix[usersWithOutgroup[i]][argumentIndex];

    consensusSum += userConsensusScores[i] * uniqueness;
    uniquenessSum += uniqueness;
  }

  return consensusSum / uniquenessSum;
}

function getFragmentationScore(argumentIndex: number,
  votingMatrix: number[][],
  sum_pos_pos: number[][],
  sum_pos_neg: number[][],
  uniquenessMatrix: number[][]) {
  /**
   * Average disalignment with ingroup members
   */

  //Identify users who voted on this argument (agree/disagree)
  const usersWhoVoted = votingMatrix.map((row, i) =>
    row[argumentIndex] !== 0 ? i : null).filter(i => i !== null) as number[];

  // Users are automatically in their own ingroup, so no need to filter
  const usersWithIngroup = usersWhoVoted;

  // Compute individual user scores (to be aggregated as the final argument score later)
  const userFragmentationScores = new Array(usersWithIngroup.length).fill(0);

  for (let i = 0; i < usersWithIngroup.length; i++) {
    const vote = votingMatrix[usersWithIngroup[i]][argumentIndex];
    const sumIngroupAgree = sum_pos_pos[usersWithIngroup[i]][argumentIndex];
    const sumIngroupDisagree = sum_pos_neg[usersWithIngroup[i]][argumentIndex];
    const sumDisalignedIngroup = vote === -1 ? sumIngroupAgree : sumIngroupDisagree;

    userFragmentationScores[i] = sumDisalignedIngroup / (sumIngroupAgree + sumIngroupDisagree);
  }

  // Average of user scores, weighted by uniqueness
  let fragmentationSum = 0;
  let uniquenessSum = 0;
  for (let i = 0; i < usersWithIngroup.length; i++) {
    let uniqueness = uniquenessMatrix[usersWithIngroup[i]][argumentIndex];

    fragmentationSum += userFragmentationScores[i] * uniqueness;
    uniquenessSum += uniqueness;
  }

  const fragmentationScore = 2 * fragmentationSum / uniquenessSum;

  if (!isFinite(fragmentationScore)) {
    throw new Error("Fragmentation score is not a finite number");
  }

  return fragmentationScore;
}

function getClarityScore(argumentIndex: number,
  votingMatrix: number[][],
  unclearMatrix: number[][],
  uniquenessMatrix: number[][]) {
  /**
   * One minus average number of unclear votes
   */

  //Identify all users who reacted on this argument
  const usersWhoReacted = votingMatrix.map((row, i) =>
    (row[argumentIndex] !== 0 || unclearMatrix[i][argumentIndex] !== 0) ? i : null
  ).filter(i => i !== null) as number[];

  // Average of unclear scores, weighted by uniqueness
  let unclearSum = 0;
  let uniquenessSum = 0;
  for (let i = 0; i < usersWhoReacted.length; i++) {
    let uniqueness = uniquenessMatrix[usersWhoReacted[i]][argumentIndex];

    unclearSum += unclearMatrix[usersWhoReacted[i]][argumentIndex] * uniqueness;
    uniquenessSum += uniqueness;
  }

  return 1 - (unclearSum / uniquenessSum);
}

export async function getArgumentScores(graphId: string): Promise<Map<string, Score>> {
  const {
    argumentIndexMap,
    votingMatrix,
    unclearMatrix,
    uniquenessMatrix,
    sum_pos_pos,
    sum_pos_neg,
    sum_neg_pos,
    sum_neg_neg,
  } = await analyzeReactions(graphId);

  // Calculate the argument scores for each argument
  const argumentScores: Map<string, Score> = new Map();

  argumentIndexMap.forEach((argumentIndex, argumentId) => {
    const consensus = getConsensusScore(argumentIndex, votingMatrix, sum_neg_pos, sum_neg_neg, uniquenessMatrix);
    const fragmentation = getFragmentationScore(argumentIndex, votingMatrix, sum_pos_pos, sum_pos_neg, uniquenessMatrix);
    const clarity = getClarityScore(argumentIndex, votingMatrix, unclearMatrix, uniquenessMatrix);

    argumentScores.set(argumentId, {
      consensus: consensus === null ? undefined : consensus,
      fragmentation: fragmentation == null ? undefined : fragmentation,
      clarity
    });
  });
  return argumentScores;
}
