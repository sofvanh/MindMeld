import { DbReaction } from "../../../db/dbTypes";
import { addAndRemoveReactions, getSpecificUserArgumentReactions } from "../../../db/operations/reactionOperations";
import { ReactionBatchableAction } from "../batchableAction";
import { sendUserReactionsUpdate, sendGraphReactionsAndScoresUpdate } from "../../updateHandler";
import { UserReaction } from "../../../.shared/types";


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
  const uniquePairs: Array<{ userId: string, argumentId: string }> = Array.from(new Set(actions.map(action =>
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

  const { reactionsToRemove, reactionsToAdd, newUserReactions } = getReactionIdsToRemoveAndReactionsToAdd(currentReactions, actionsByUserAndArgument)
  await addAndRemoveReactions(reactionsToAdd, reactionsToRemove.map(reaction => reaction.id));
  await emitUpdates(actions, newUserReactions);
  console.timeEnd("processReactionBatch")
}

function getReactionIdsToRemoveAndReactionsToAdd(
  currentReactions: DbReaction[],
  actionsByUserAndArgument: Map<string, Map<string, ReactionBatchableAction[]>>
): {
  reactionsToRemove: DbReaction[],
  reactionsToAdd: { userId: string, argumentId: string, type: 'agree' | 'disagree' | 'unclear' }[],
  newUserReactions: Map<string, Map<string, UserReaction>>
} {
  const reactionsToRemove: DbReaction[] = []
  const reactionsToAdd: { userId: string, argumentId: string, type: 'agree' | 'disagree' | 'unclear' }[] = []
  // Map of user id to argument id to user reaction
  const newUserReactions: Map<string, Map<string, UserReaction>> = new Map()

  for (const [userId, argumentMap] of actionsByUserAndArgument) {
    const userReactions = new Map<string, UserReaction>();
    for (const [argumentId, userArgumentActions] of argumentMap) {
      const currentReactionState = currentReactions.filter(reaction =>
        reaction.user_id === userId && reaction.argument_id === argumentId
      );

      // Initialize reaction state as UserReaction object
      let newReactionState: UserReaction = {
        agree: currentReactionState.some(r => r.type === 'agree'),
        disagree: currentReactionState.some(r => r.type === 'disagree'),
        unclear: currentReactionState.some(r => r.type === 'unclear')
      };

      for (const action of userArgumentActions) {
        if (action.type === 'add reaction') {
          if (newReactionState[action.data.type as keyof UserReaction]) {
            console.error("Reaction already exists", action.data.type, "for user", userId, "on argument", argumentId);
            continue;
          }
          // Handle mutually exclusive reactions
          if (action.data.type === 'agree' && newReactionState.disagree) {
            newReactionState.disagree = false;
          } else if (action.data.type === 'disagree' && newReactionState.agree) {
            newReactionState.agree = false;
          }
          newReactionState[action.data.type as keyof UserReaction] = true;
        } else if (action.type === 'remove reaction') {
          if (!newReactionState[action.data.type as keyof UserReaction]) {
            console.error("Reaction does not exist", action.data.type, "for user", userId, "on argument", argumentId);
            continue;
          }
          newReactionState[action.data.type as keyof UserReaction] = false;
        }
      }

      // Get reactions to remove - those in current state but not in new state
      for (const reaction of currentReactionState) {
        if (!newReactionState[reaction.type as keyof UserReaction]) {
          reactionsToRemove.push(reaction);
        }
      }

      // Get reactions to add - those in new state but not in current state
      (Object.entries(newReactionState) as [keyof UserReaction, boolean][]).forEach(([type, value]) => {
        if (value && !currentReactionState.some(r => r.type === type)) {
          reactionsToAdd.push({
            userId,
            argumentId,
            type: type as 'agree' | 'disagree' | 'unclear'
          });
        }
      });

      userReactions.set(argumentId, newReactionState);
    }
    newUserReactions.set(userId, userReactions);
  }

  return { reactionsToRemove, reactionsToAdd, newUserReactions };
}

async function emitUpdates(actions: Array<ReactionBatchableAction>, newUserReactions: Map<string, Map<string, UserReaction>>) {
  // Track affected users and graphs
  const affectedUsers = new Set(actions.map(action => action.socket.data.user.id));
  const affectedGraphs = new Set(actions.map(action => action.data.graphId));

  // Send updates to affected users
  for (const userId of affectedUsers) {
    // Find a socket for this user from any of their actions
    const userSocket = actions.find(action => action.socket.data.user.id === userId)?.socket;
    if (userSocket) {
      await sendUserReactionsUpdate(userSocket, newUserReactions.get(userId)!);
    }
  }

  // Send graph-wide updates
  // TODO Only update scores and reactions that changed
  for (const graphId of affectedGraphs) {
    await sendGraphReactionsAndScoresUpdate(actions[0].io, graphId);
  }
}