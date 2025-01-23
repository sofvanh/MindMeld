import { DbReaction } from "../../../db/dbTypes";
import { addAndRemoveReactions, getSpecificUserArgumentReactions } from "../../../db/operations/reactionOperations";
import { ReactionBatchableAction } from "../batchableAction";


/**
 * Processes a batch of reaction actions by efficiently handling database updates.
 * 
 * The function:
 * 1. Retrieves current reactions for all relevant user-argument pairs
 * 2. Groups and processes actions by user and argument to determine state changes
 * 3. Calculates the difference between current and new reaction states
 * 4. Generates lists of reactions to add and remove
 * 5. Executes a single database transaction for all changes
 * 6. Emits updates to connected clients
 * 
 * Note: Score recalculation may be deferred until argument batch processing completes
 */
export async function processReactionBatch(
  actions: Array<ReactionBatchableAction>
) {
  if (actions.length === 0) {
    console.log("No reaction actions to process")
    return;
  }

  console.log("In processReactionBatch")
  console.time("processReactionBatch")

  // Get the current reactions for each user and argument
  const uniquePairs = Array.from(new Set(actions.map(action =>
    JSON.stringify({ userId: action.socket.data.user.id, argumentId: action.data.argumentId })
  ))).map(str => JSON.parse(str));
  const currentReactions: DbReaction[] = await getSpecificUserArgumentReactions(uniquePairs);

  // Group actions by user and argument
  const actionsByUserAndArgument = new Map<string, Map<string, ReactionBatchableAction[]>>();
  for (const action of actions) {
    const userId = action.socket.data.user.id;
    const argumentId = action.data.argumentId;
    if (!actionsByUserAndArgument.has(userId)) {
      actionsByUserAndArgument.set(userId, new Map());
    }
    const userActions = actionsByUserAndArgument.get(userId)!;
    if (!userActions.has(argumentId)) {
      userActions.set(argumentId, []);
    }
    userActions.get(argumentId)!.push(action);
  }

  const { reactionsToRemove, reactionsToAdd } = getReactionIdsToRemoveAndReactionsToAdd(currentReactions, actionsByUserAndArgument)

  console.log("Reactions to remove:", reactionsToRemove.map(reaction => reaction.id))
  console.log("Reactions to add:", reactionsToAdd)

  await addAndRemoveReactions(reactionsToAdd, reactionsToRemove.map(reaction => reaction.id));

  console.timeEnd("processReactionBatch")
}

function getReactionIdsToRemoveAndReactionsToAdd(
  currentReactions: DbReaction[],
  actionsByUserAndArgument: Map<string, Map<string, ReactionBatchableAction[]>>
): {
  reactionsToRemove: DbReaction[],
  reactionsToAdd: { userId: string, argumentId: string, type: 'agree' | 'disagree' | 'unclear' }[]
} {
  const reactionsToRemove: DbReaction[] = []
  const reactionsToAdd: { userId: string, argumentId: string, type: 'agree' | 'disagree' | 'unclear' }[] = []

  for (const [userId, argumentMap] of actionsByUserAndArgument) {
    for (const [argumentId, userArgumentActions] of argumentMap) {
      const currentReactionState = currentReactions.filter(reaction => reaction.user_id === userId && reaction.argument_id === argumentId);
      const newReactionState: ('agree' | 'disagree' | 'unclear')[] = currentReactionState.map(reaction => reaction.type as 'agree' | 'disagree' | 'unclear');
      for (const action of userArgumentActions) {
        if (action.type === 'add reaction') {
          if (newReactionState.includes(action.data.type)) {
            console.debug("Reaction already exists", action.data.type, "for user", userId, "on argument", argumentId);
            continue;
          } else if (action.data.type === 'agree' && newReactionState.includes('disagree')) {
            newReactionState.splice(newReactionState.indexOf('disagree'), 1)
          } else if (action.data.type === 'disagree' && newReactionState.includes('agree')) {
            newReactionState.splice(newReactionState.indexOf('agree'), 1)
          }
          newReactionState.push(action.data.type)
        } else if (action.type === 'remove reaction') {
          if (newReactionState.includes(action.data.type)) {
            newReactionState.splice(newReactionState.indexOf(action.data.type), 1)
          } else {
            console.debug("Reaction does not exist", action.data.type, "for user", userId, "on argument", argumentId)
          }
        }
      }

      // Get reactions to remove - those in current state but not in new state
      for (const reaction of currentReactionState) {
        if (!newReactionState.includes(reaction.type as 'agree' | 'disagree' | 'unclear')) {
          reactionsToRemove.push(reaction);
        }
      }

      // Get reactions to add - those in new state but not in current state
      for (const type of newReactionState) {
        if (!currentReactionState.some(r => r.type === type)) {
          reactionsToAdd.push({
            userId,
            argumentId,
            type
          });
        }
      }
    }
  }

  return { reactionsToRemove, reactionsToAdd }
}