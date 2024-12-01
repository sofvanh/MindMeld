import { analyzeVotes } from "./voteAnalyzer";
import { getArgumentScores, ArgumentScore} from "./argumentScoreHandler";
import { ReactionForGraph, getReactionsForGraph} from "../db/operations/reactionOperations";
import { getArgumentIdsByGraphId } from "../db/operations/argumentOperations";

interface ArgumentPriority {
    argumentId: string;
    priority: number;
}

async function getUniquenessScores(userId: string, graphId: string): Promise<Map<string, number>> {
    const {
        userIndexMap,
        argumentIndexMap,
        votingMatrix,
        uniquenessMatrix
    } = await analyzeVotes(graphId);

    const userIndex = userIndexMap.get(userId);
    if (!userIndex) {
        return new Map<string, number>();
    }
    else {
        const uniquenessScores = new Map<string, number>();
        argumentIndexMap.forEach((argumentIndex, argumentId) => {
            const uniquenessScore = uniquenessMatrix[userIndex][argumentIndex];
            uniquenessScores.set(argumentId, uniquenessScore);
        });
        return uniquenessScores;
    }
}

export async function getArgumentPriority(graphId: string, userId: string): Promise<ArgumentPriority[]> {
    const argumentIds = await getArgumentIdsByGraphId(graphId);
    const argumentPriorityMap = new Map<string, number>();

    // Record which arguments the user has reacted to
    const reactions: ReactionForGraph[] = await getReactionsForGraph(graphId);
    const userReactions = reactions.filter(reaction => reaction.userId === userId);
    const userReactedMap = new Map<string, boolean>();
    userReactions.forEach(reaction => userReactedMap.set(reaction.argumentId, true));
    
    // Get priority for arguments with scores (consensus, fragmentation, clarity)
    const argumentScores: ArgumentScore[] = await getArgumentScores(graphId);
    const uniquenessScores: Map<string, number> = await getUniquenessScores(userId, graphId);

    for (const argumentScore of argumentScores) {
        const argumentId = argumentScore.argumentId;
        const consensusScore = argumentScore.consensusScore;
        const fragmentationScore = argumentScore.fragmentationScore;
        const clarityScore = argumentScore.clarityScore;
        const uniquenessScore = uniquenessScores.get(argumentId) || 1;

        console.log('User: ' + userId);
        console.log(`Argument: ${argumentId}, Consensus: ${consensusScore}, Fragmentation: ${fragmentationScore}, Clarity: ${clarityScore}, Uniqueness: ${uniquenessScore}`);

        let priority = (1 + 50*consensusScore + 50*fragmentationScore ) * (clarityScore ** 2) * (uniquenessScore ** 2);

        argumentPriorityMap.set(argumentId, priority);
    }

    // Add priority for arguments without scores
    for (const argumentId of argumentIds) {
        if (!argumentPriorityMap.has(argumentId)) {
            argumentPriorityMap.set(argumentId, 1);
        }
    }

    // Set priority to 0 for arguments the user has already reacted to
    userReactedMap.forEach((_, argumentId) => {
        argumentPriorityMap.set(argumentId, 0);
    });

    // Sort arguments by priority and return
    const argumentPriorityArray: ArgumentPriority[] = [];
    argumentPriorityMap.forEach((priority, argumentId) => {
        argumentPriorityArray.push({ argumentId, priority });
    });

    argumentPriorityArray.sort((a, b) => b.priority - a.priority);
    return argumentPriorityArray;
}