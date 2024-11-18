import { ReactionForGraph, getReactionsForGraph } from "../db/operations/reactionOperations";
import { cosineSimilarityMatrix } from "../utils/math";

export async function getArgumentScores(graphId: string) {
    const reactionArray: ReactionForGraph[] = await getReactionsForGraph(graphId);
    const minimumVotes = 3;

    // Count votes for each user
    const userVoteCounts = new Map<string, number>();
    for (const reaction of reactionArray) {
        if (reaction.type === 'agree' || reaction.type === 'disagree') {
            userVoteCounts.set(reaction.userId, (userVoteCounts.get(reaction.userId) || 0) + 1);
        }
    }

    // Creat maps for user and argument indices
    const userIndexMap = new Map<string, number>();
    const argumentIndexMap = new Map<string, number>();
    let userIndex = 0;
    let argumentIndex = 0;

    // Fill the maps
    for (const reaction of reactionArray) {
        const userVoteCount = userVoteCounts.get(reaction.userId) || 0;
        if (userVoteCount >= minimumVotes) {
            if (!userIndexMap.has(reaction.userId)) {
                userIndexMap.set(reaction.userId, userIndex);
                userIndex++;
            }
            if (!argumentIndexMap.has(reaction.argumentId)) {
                argumentIndexMap.set(reaction.argumentId, argumentIndex);
                argumentIndex++;
            }
        }
    }
    
    const userCount = userIndexMap.size;
    const argumentCount = argumentIndexMap.size;

    // Initialize the voting matrix and unclear matrix
    const votingMatrix = new Array(userCount).fill(0).map(() => new Array(argumentCount).fill(0));
    const unclearMatrix = new Array(userCount).fill(0).map(() => new Array(argumentCount).fill(0));

    // Fill the matrices
    for (const reaction of reactionArray) {
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
    
    // Calculate the argument scores
    const argumentScores: { argumentId: string, 
                            consensusScore: number, 
                            fragmentationScore: number
                            clarityScore: number}[] = [];
    
    for (const [argumentId, argumentIndex] of argumentIndexMap) {
        //Identify users who voted on this argument
        const usersWhoVoted: number[] = [];
        for (let i = 0; i < userCount; i++) {
            if (votingMatrix[i][argumentIndex] !== 0) {
                usersWhoVoted.push(i);
            }
        }
        const votes = usersWhoVoted.map(i => votingMatrix[i][argumentIndex]);

        if (usersWhoVoted.length >= 2) {

            // Get matrices for users who voted
            const userSimilarities = usersWhoVoted.map(i => 
                usersWhoVoted.map(j => userSimilarityMatrix[i][j])
            );
            const userAgreementMatrix = votes.map(voteI => 
                votes.map(voteJ => (voteI === voteJ ? 1 : 0))
            );
            const userDisagreementMatrix = votes.map(voteI =>
                votes.map(voteJ => (voteI === -voteJ ? 1 : 0))
            );

            const userConsensusScores = new Array(usersWhoVoted.length).fill(0);
            const userFragmentationScores = new Array(usersWhoVoted.length).fill(0);
            const userUniquenessScores = new Array(usersWhoVoted.length).fill(0);
            const userUnclearScores = new Array(usersWhoVoted.length).fill(0);

            for (let i = 0; i < usersWhoVoted.length; i++) {
                // Partition users into in-group and out-group
                const inGroup: number[] = [];
                const outGroup: number[] = [];
                for (let j = 0; j < usersWhoVoted.length; j++) {
                   const similarity = userSimilarities[i][j];
                   if (similarity > 0) {
                       inGroup.push(j);
                   } else if (similarity < 0) {
                       outGroup.push(j);
                   }
                }

                // Calculate user consensus score
                if (outGroup.length > 0) {
                    let consensusSum = 0
                    let outgroupSimilaritySum = 0;
                    for (const j of outGroup) {
                        consensusSum += userAgreementMatrix[i][j] * userSimilarities[i][j];
                        outgroupSimilaritySum += userSimilarities[i][j];
                    }
                    userConsensusScores[i] = consensusSum / outgroupSimilaritySum;
                }
                else {
                    userConsensusScores[i] = 0;
                }

                // Calculate user fragmentation score
                let fragmentationSum = 0;
                let ingroupSimilaritySum = 0;
                for (const j of inGroup) { // inGroup.length is always > 0 (includes self)
                    fragmentationSum += userDisagreementMatrix[i][j] * userSimilarities[i][j];
                    ingroupSimilaritySum += userSimilarities[i][j];
                }
                userFragmentationScores[i] = fragmentationSum / ingroupSimilaritySum;


                // Calculate user uniqueness score
                userUniquenessScores[i] = 1 / ingroupSimilaritySum

                // Get user unclear score
                userUnclearScores[i] = unclearMatrix[usersWhoVoted[i]][argumentIndex];
            }
        
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

            argumentScores.push({ argumentId, 
                                  consensusScore: argumentConsensusScore, 
                                  fragmentationScore: argumentFragmentationScore,
                                  clarityScore: argumentClarityScore });
        }
    }
    // Add argument scores to database

}