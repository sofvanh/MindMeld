import { ReactionCounts, ReactionAction, UserReaction } from "./types"

export const applyReactionActions = (reactionCounts: ReactionCounts, userReaction: UserReaction, reactionActions: ReactionAction[]): { reactionCounts: ReactionCounts, userReaction: UserReaction } => {
  const newReactionCounts = { ...reactionCounts };
  const newUserReaction = { ...userReaction };
  reactionActions.forEach(reaction => {
    if (reaction.actionType === 'add') {
      if (newUserReaction[reaction.reactionType]) {
        return;
      }
      if (reaction.reactionType === 'agree' && newUserReaction.disagree) {
        newUserReaction.disagree = false;
        newReactionCounts.disagree = (newReactionCounts.disagree || 0) - 1;
      } else if (reaction.reactionType === 'disagree' && newUserReaction.agree) {
        newUserReaction.agree = false;
        newReactionCounts.agree = (newReactionCounts.agree || 0) - 1;
      }
      newUserReaction[reaction.reactionType] = true;
      newReactionCounts[reaction.reactionType] = (newReactionCounts[reaction.reactionType] || 0) + 1;
    } else {
      if (!newUserReaction[reaction.reactionType]) {
        return;
      }
      newUserReaction[reaction.reactionType] = false;
      newReactionCounts[reaction.reactionType] = (newReactionCounts[reaction.reactionType] || 0) - 1;
    }
  })

  return {
    reactionCounts: newReactionCounts,
    userReaction: newUserReaction
  }
}