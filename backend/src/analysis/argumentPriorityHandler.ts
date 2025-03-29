import { analyzeReactions } from "./reactionAnalyzer";
import { getArgumentScores } from "./argumentScoreHandler";
import { getReactionsByGraphId } from "../db/operations/reactionOperations";
import { getArgumentsByGraphId } from "../db/operations/argumentOperations";
import { DbArgument } from "../db/dbTypes";

async function getUniquenessScores(userId: string, graphId: string): Promise<Map<string, number>> {
  const {
    userIndexMap,
    argumentIndexMap,
    uniquenessMatrix
  } = await analyzeReactions(graphId);

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
export async function getArgumentPriorities(graphId: string, userId: string): Promise<Map<DbArgument, number>> {
  const [
    graphArguments,
    reactions,
    argumentScores,
    uniquenessScores
  ] = await Promise.all([
    getArgumentsByGraphId(graphId),
    getReactionsByGraphId(graphId),
    getArgumentScores(graphId),
    getUniquenessScores(userId, graphId)
  ]);

  const argumentPriorityMap = new Map<string, number>();
  const userReactedMap = new Map<string, boolean>(
    reactions.filter(reaction => reaction.user_id === userId).map(reaction => [reaction.argument_id, true])
  );

  // Get priority for arguments with scores (consensus, fragmentation, clarity)
  for (const [argumentId, score] of argumentScores) {
    const uniquenessScore = uniquenessScores.get(argumentId) ?? 1;
    const priority = uniquenessScore * (1 + score.clarity + (score.consensus ?? 0) + (score.fragmentation ?? 0));
    argumentPriorityMap.set(argumentId, priority);
  }

  // Add default priority for arguments without scores
  graphArguments.forEach(argument => {
    if (!argumentPriorityMap.has(argument.id)) {
      argumentPriorityMap.set(argument.id, 1);
    }
  });

  // Set priority to 0 for arguments the user has already reacted to
  userReactedMap.forEach((_, argumentId) => {
    argumentPriorityMap.set(argumentId, 0);
  });

  // Sort arguments by priority and return
  const sortedEntries = Array.from(argumentPriorityMap.entries())
    .sort(([, a], [, b]) => b - a);
  return new Map(sortedEntries.map(([argumentId, priority]) => [
    graphArguments.find(arg => arg.id === argumentId)!,
    priority
  ]));
}
