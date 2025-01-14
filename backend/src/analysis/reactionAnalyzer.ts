import { ReactionForGraph, getReactionsForGraph } from "../db/operations/reactionOperations";
import { cosineSimilarityMatrix, computeAllSums } from "../utils/math";

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

function filterReactions(reactions: ReactionForGraph[]): ReactionForGraph[] {
    const MINIMUM_VOTES_USER = 3;
    const userCounts = reactions.reduce((counts, reaction) => {
        if (reaction.type === 'agree' || reaction.type === 'disagree') {
            counts[reaction.userId] = (counts[reaction.userId] || 0) + 1;
        }
        return counts;
    }, {} as Record<string, number>);
    return reactions.filter(reaction =>
        (userCounts[reaction.userId] || 0) >= MINIMUM_VOTES_USER
    );
}

export async function analyzeReactions(graphId: string): Promise<ReactionAnalysis> {
    const reactionArray: ReactionForGraph[] = await getReactionsForGraph(graphId);
    const filteredReactions = filterReactions(reactionArray);

    // Create maps for user and argument indices
    const userIndexMap = new Map<string, number>();
    const argumentIndexMap = new Map<string, number>();

    // Fill the maps
    let userIndexCounter = 0;
    let argumentIndexCounter = 0;

    filteredReactions.forEach(reaction => {
        if (!userIndexMap.has(reaction.userId)) {
            userIndexMap.set(reaction.userId, userIndexCounter++);
        }
        if (!argumentIndexMap.has(reaction.argumentId)) {
            argumentIndexMap.set(reaction.argumentId, argumentIndexCounter++);
        }
    });

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
    const { sum_pos_pos, sum_pos_neg, sum_neg_pos, sum_neg_neg } = computeAllSums(userSimilarityMatrix, votingMatrix);

    // Calculate the uniqueness matrix
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