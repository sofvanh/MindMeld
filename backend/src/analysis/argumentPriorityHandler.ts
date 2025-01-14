import { Score } from "../.shared/types";
import { analyzeVotes } from "./reactionAnalyzer";
import { getArgumentScores } from "./argumentScoreHandler";
import { ReactionForGraph, getReactionsForGraph } from "../db/operations/reactionOperations";
import { getArgumentIdsByGraphId } from "../db/operations/argumentOperations";

interface ArgumentPriority {
    argumentId: string;
    priority: number;
}

async function getUniquenessScores(userId: string, graphId: string): Promise<Map<string, number>> {
    const {
        userIndexMap,
        argumentIndexMap,
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

// TODO Update this now that consensus or fragmentation can be undefined
export async function getArgumentPriorities(graphId: string, userId: string): Promise<ArgumentPriority[]> {
    const argumentIds = await getArgumentIdsByGraphId(graphId);
    const argumentPriorityMap = new Map<string, number>();

    // Record which arguments the user has reacted to
    const reactions: ReactionForGraph[] = await getReactionsForGraph(graphId);
    const userReactedMap = new Map<string, boolean>(
        reactions.filter(reaction => reaction.userId === userId).map(reaction => [reaction.argumentId, true])
    );

    // Get priority for arguments with scores (consensus, fragmentation, clarity)
    const argumentScores: Map<string, Score> = await getArgumentScores(graphId);
    const uniquenessScores: Map<string, number> = await getUniquenessScores(userId, graphId);

    for (const [argumentId, score] of argumentScores) {
        const uniquenessScore = uniquenessScores.get(argumentId) ?? 1;
        const priority = (1 + 50 * (score.consensus ?? 0) + 50 * (score.fragmentation ?? 0)) * (score.clarity ** 2) * (uniquenessScore ** 2);
        argumentPriorityMap.set(argumentId, priority);
    }

    // Add default priority for arguments without scores
    argumentIds.forEach(argumentId => {
        if (!argumentPriorityMap.has(argumentId)) {
            argumentPriorityMap.set(argumentId, 1);
        }
    });

    // Set priority to 0 for arguments the user has already reacted to
    userReactedMap.forEach((_, argumentId) => {
        argumentPriorityMap.set(argumentId, 0);
    });

    // Sort arguments by priority and return
    return Array.from(argumentPriorityMap, ([argumentId, priority]) => ({ argumentId, priority }))
        .sort((a, b) => b.priority - a.priority);
}