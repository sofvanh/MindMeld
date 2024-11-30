import { sum } from "@tensorflow/tfjs-node";
import { ReactionForGraph, getReactionsForGraph} from "../db/operations/reactionOperations";
import { cosineSimilarityMatrix, computeAllSums} from "../utils/math";


interface ArgumentScore {
  argumentId: string;
  consensusScore: number;
  fragmentationScore: number;
  clarityScore: number;
}

export async function getArgumentScores(graphId: string): Promise<ArgumentScore[]> {
  const reactionArray: ReactionForGraph[] = await getReactionsForGraph(graphId);
  const minimumVotesUser = 3;
  const minimumVotesArgument = 2;

  // Count votes for each user and each argument
  const userVoteCounts = new Map<string, number>();
  const argumentVoteCounts = new Map<string, number>();

  for (const reaction of reactionArray) {
    if (reaction.type === 'agree' || reaction.type === 'disagree') {
      userVoteCounts.set(reaction.userId, (userVoteCounts.get(reaction.userId) || 0) + 1);
      argumentVoteCounts.set(reaction.argumentId, (argumentVoteCounts.get(reaction.argumentId) || 0) + 1);
    }
  }

  // Filter reactions
  const filteredReactions = reactionArray.filter(reaction => {
    const userVoteCount = userVoteCounts.get(reaction.userId) || 0;
    const argumentVoteCount = argumentVoteCounts.get(reaction.argumentId) || 0;
    return userVoteCount >= minimumVotesUser && argumentVoteCount >= minimumVotesArgument;
  });

  // Create maps for user and argument indices
  const userIndexMap = new Map<string, number>();
  const argumentIndexMap = new Map<string, number>();

  // Fill the maps
  let userIndex = 0;
  let argumentIndex = 0;

  for (const reaction of filteredReactions) {
    if (!userIndexMap.has(reaction.userId)) {
      userIndexMap.set(reaction.userId, userIndex);
      userIndex++;
    }
    if (!argumentIndexMap.has(reaction.argumentId)) {
      argumentIndexMap.set(reaction.argumentId, argumentIndex);
      argumentIndex++;
    }
  }

  // Initialize the voting matrix and unclear matrix
  const userCount = userIndexMap.size;
  const argumentCount = argumentIndexMap.size;

  const votingMatrix = new Array(userCount).fill(0).map(() => new Array(argumentCount).fill(0));
  const unclearMatrix = new Array(userCount).fill(0).map(() => new Array(argumentCount).fill(0));

  // Fill the matrices
  for (const reaction of filteredReactions) {
    const argumentIdx = argumentIndexMap.get(reaction.argumentId)!;
    const userIdx = userIndexMap.get(reaction.userId)!;
    if (reaction.type === 'agree') {
      votingMatrix[userIdx][argumentIdx] = 1;
    }
    else if (reaction.type === 'disagree') {
      votingMatrix[userIdx][argumentIdx] = -1;
    }
    else if (reaction.type === 'unclear') {
      unclearMatrix[userIdx][argumentIdx] = 1;
    }
    else {
      throw new Error('Invalid reaction type');
    }
  }

  // Calculate the user similarity matrix
  const userSimilarityMatrix: number[][] = cosineSimilarityMatrix(votingMatrix);

  // Calculate the sum matrices
  const { sum_pos_pos, sum_pos_neg, sum_neg_pos, sum_neg_neg} = computeAllSums(userSimilarityMatrix, votingMatrix);

  // Calculate the argument scores for each argument
  const argumentScores: ArgumentScore[] = [];

  argumentIndexMap.forEach((argumentIndex, argumentId) => {
    //Identify users who voted on this argument
    const usersWhoVoted: number[] = [];
    for (let i = 0; i < userCount; i++) {
      if (votingMatrix[i][argumentIndex] !== 0) {
        usersWhoVoted.push(i);
      }
    }
    const votes = usersWhoVoted.map(i => votingMatrix[i][argumentIndex]);

    if (usersWhoVoted.length >= 2) {

      // Get smaller matrices for just the users who voted
      const userSimilarities = usersWhoVoted.map(i =>
        usersWhoVoted.map(j => userSimilarityMatrix[i][j])
      );

      // Compute individual user scores (to be aggregated as the final argument score later)
      const userConsensusScores = new Array(usersWhoVoted.length).fill(0);
      const userFragmentationScores = new Array(usersWhoVoted.length).fill(0);
      const userUniquenessScores = new Array(usersWhoVoted.length).fill(0);
      const userUnclearScores = new Array(usersWhoVoted.length).fill(0);

      for (let i = 0; i < usersWhoVoted.length; i++) {

        // Get in-group and out-group users
        const sumIngroupAgree = sum_pos_pos[usersWhoVoted[i]][argumentIndex];
        const sumIngroupDisagree = sum_pos_neg[usersWhoVoted[i]][argumentIndex];
        const sumOutgroupAgree = sum_neg_pos[usersWhoVoted[i]][argumentIndex];
        const sumOutgroupDisagree = sum_neg_neg[usersWhoVoted[i]][argumentIndex];

        // Calculate user consensus score
        const sumAlignedOutgroup = votes[i] === 1 ? sumOutgroupAgree : sumOutgroupDisagree;
        const sumOutgroup = sumOutgroupAgree + sumOutgroupDisagree;
        if (sumOutgroup > 0) {
            userConsensusScores[i] = sumAlignedOutgroup / sumOutgroup;
        }
        else {
          userConsensusScores[i] = 0;
        }

        // Calculate user fragmentation score
        const sumDisalignedIngroup = votes[i] === -1 ? sumIngroupAgree : sumIngroupDisagree;
        const sumIngroup = sumIngroupAgree + sumIngroupDisagree;
        userFragmentationScores[i] = sumDisalignedIngroup / sumIngroup;

        // Calculate user uniqueness score
        userUniquenessScores[i] = 1 / (sumIngroup);

        // Get user unclear score
        userUnclearScores[i] = unclearMatrix[usersWhoVoted[i]][argumentIndex];
      }

      // Aggregate user scores to get argument scores
      // Weighted average of user scores, weighted by uniqueness score

      // Calculate argument consensus score
      let weightedConsensusSum = 0;
      let uniquenessSum = 0;
      for (let i = 0; i < usersWhoVoted.length; i++) {
        weightedConsensusSum += userConsensusScores[i] * userUniquenessScores[i];
        uniquenessSum += userUniquenessScores[i];
      }
      const argumentConsensusScore = weightedConsensusSum / uniquenessSum;

      // Calculate argument fragmentation score
      let weightedFragmentationSum = 0;
      for (let i = 0; i < usersWhoVoted.length; i++) {
        weightedFragmentationSum += userFragmentationScores[i] * userUniquenessScores[i];
      }
      // Score is multiplied by 2 to scale it to the range [0, 1]
      const argumentFragmentationScore = (weightedFragmentationSum / uniquenessSum) * 2;

      // Calculate argument clarity score
      let unclearSum = 0;
      for (let i = 0; i < usersWhoVoted.length; i++) {
        unclearSum += userUnclearScores[i] * userUniquenessScores[i];
      }
      const argumentClarityScore = 1 - (unclearSum / uniquenessSum);

      argumentScores.push({
        argumentId,
        consensusScore: argumentConsensusScore,
        fragmentationScore: argumentFragmentationScore,
        clarityScore: argumentClarityScore
      });
    }
  });

  return argumentScores;
}