import { analyzeVotes } from "./voteAnalyzer";

interface ArgumentScore {
  argumentId: string;
  consensusScore: number;
  fragmentationScore: number;
  clarityScore: number;
}

function getArgumentClarityScore(argumentIndex: number, 
                                 votingMatrix: number[][],
                                 unclearMatrix: number[][], 
                                 sum_pos_pos: number[][],
                                 sum_pos_neg: number[][]) {

  //Identify all users who reacted on this argument 
  let usersWhoReacted: number[] = [];
  for (let i = 0; i < votingMatrix.length; i++) {
    if (votingMatrix[i][argumentIndex] !== 0 || unclearMatrix[i][argumentIndex] !== 0) {
      usersWhoReacted.push(i);
    }
  }

  let unclearSum = 0;
  let uniquenessSum = 0;
  for (let i = 0; i < usersWhoReacted.length; i++) {
    const sumIngroupAgree = sum_pos_pos[usersWhoReacted[i]][argumentIndex];
    const sumIngroupDisagree = sum_pos_neg[usersWhoReacted[i]][argumentIndex];
    const sumIngroupNoVote = votingMatrix[usersWhoReacted[i]][argumentIndex] === 0 ? 1 : 0;

    let sumIngroup = sumIngroupAgree + sumIngroupDisagree + sumIngroupNoVote;

    unclearSum += unclearMatrix[usersWhoReacted[i]][argumentIndex] / sumIngroup;
    uniquenessSum += 1 / sumIngroup;
  }

  return 1 - (unclearSum / uniquenessSum);
}

export async function getArgumentScores(graphId: string): Promise<ArgumentScore[]> {
    const {
        userIndexMap,
        argumentIndexMap,
        votingMatrix,
        unclearMatrix,
        sum_pos_pos,
        sum_pos_neg,
        sum_neg_pos,
        sum_neg_neg,
    } = await analyzeVotes(graphId);

  // Calculate the argument scores for each argument
  const argumentScores: ArgumentScore[] = [];

  argumentIndexMap.forEach((argumentIndex, argumentId) => {
    //Identify users who voted on this argument
    const usersWhoVoted: number[] = [];
    for (let i = 0; i < userIndexMap.size; i++) {
      if (votingMatrix[i][argumentIndex] !== 0) {
        usersWhoVoted.push(i);
      }
    }
    const votes = usersWhoVoted.map(i => votingMatrix[i][argumentIndex]);

    if (usersWhoVoted.length >= 2) {

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
      const argumentClarityScore = getArgumentClarityScore(argumentIndex, 
                                                           votingMatrix, 
                                                           unclearMatrix, 
                                                           sum_pos_pos, 
                                                           sum_pos_neg);

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