import { ReactionForGraph, getReactionsForGraph } from "../db/operations/reactionOperations";

export async function getArgumentScores(graphId: string) {
    const reactionArray: ReactionForGraph[] = await getReactionsForGraph(graphId);

    // Creat maps for user and argument indices
    const userIndexMap = new Map<string, number>();
    const argumentIndexMap = new Map<string, number>();
    let userIndex = 0;
    let argumentIndex = 0;

    // Fill the maps
    for (const reaction of reactionArray) {
        if (!userIndexMap.has(reaction.userId)) {
            userIndexMap.set(reaction.userId, userIndex);
            userIndex++;
        }
        if (!argumentIndexMap.has(reaction.argumentId)) {
            argumentIndexMap.set(reaction.argumentId, argumentIndex);
            argumentIndex++;
        }
    }
    
    const userCount = userIndexMap.size;
    const argumentCount = argumentIndexMap.size;

    // Initialize the voting matrix and unclear matrix
    const votingMatrix = new Array(argumentCount).fill(0).map(() => new Array(userCount).fill(0));
    const unclearMatrix = new Array(argumentCount).fill(0).map(() => new Array(userCount).fill(0));

    // Fill the matrices
    for (const reaction of reactionArray) {
        const argumentIdx = argumentIndexMap.get(reaction.argumentId)!;
        const userIdx = userIndexMap.get(reaction.userId)!;
        if (reaction.type === 'agree') {
            votingMatrix[argumentIdx][userIdx] = 1;
        }
        else if (reaction.type === 'disagree') {
            votingMatrix[argumentIdx][userIdx] = -1;
        }
        else if (reaction.type === 'unclear') {
            unclearMatrix[argumentIdx][userIdx] = 1;
        }
        else {
            throw new Error('Invalid reaction type');
        }
    }

}