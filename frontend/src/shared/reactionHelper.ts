import { ReactionCounts, ReactionAction, UserReaction } from "./types"


export const applyReactionToReactionCounts = (oldReactionCounts: ReactionCounts, oldUserReaction: UserReaction, action: ReactionAction): ReactionCounts => {
  const newReactionCounts = { ...oldReactionCounts };

  if (action.actionType === 'add') {
    if (!oldUserReaction[action.reactionType]) {
      if (action.reactionType === 'agree' && oldUserReaction.disagree) {
        newReactionCounts.disagree = (newReactionCounts.disagree || 0) - 1;
      } else if (action.reactionType === 'disagree' && oldUserReaction.agree) {
        newReactionCounts.agree = (newReactionCounts.agree || 0) - 1;
      }
      newReactionCounts[action.reactionType] = (newReactionCounts[action.reactionType] || 0) + 1;
    }
  } else {
    if (oldUserReaction[action.reactionType]) {
      newReactionCounts[action.reactionType] = (newReactionCounts[action.reactionType] || 0) - 1;
    }
  }

  return newReactionCounts;
}

export const applyReactionToUserReaction = (oldUserReaction: UserReaction, action: ReactionAction): UserReaction => {
  const newUserReaction = { ...oldUserReaction };
  if (action.actionType === 'add') {
    if (action.reactionType === 'agree' && newUserReaction.disagree) {
      newUserReaction.disagree = false;
    } else if (action.reactionType === 'disagree' && newUserReaction.agree) {
      newUserReaction.agree = false;
    }
    newUserReaction[action.reactionType] = true;
  } else {
    newUserReaction[action.reactionType] = false;
  }

  return newUserReaction;
}

export const applyReactionActions = (oldReactionCounts: ReactionCounts, oldUserReaction: UserReaction, reactionActions: ReactionAction[]): { reactionCounts: ReactionCounts, userReaction: UserReaction } => {
  let reactionCounts: ReactionCounts = { ...oldReactionCounts };
  let userReaction: UserReaction = { ...oldUserReaction };
  reactionActions.forEach(reaction => {
    const newReactionCounts = applyReactionToReactionCounts(reactionCounts, userReaction, reaction);
    const newUserReaction = applyReactionToUserReaction(userReaction, reaction);
    reactionCounts = newReactionCounts;
    userReaction = newUserReaction;
  })

  return {
    reactionCounts: reactionCounts,
    userReaction: userReaction
  }
}
