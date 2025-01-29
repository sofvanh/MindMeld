import { applyReactionToReactionCounts, applyReactionToUserReaction, applyReactionActions } from '../reactionHelper';
import { ReactionCounts, UserReaction, ReactionAction } from '../types';

describe('reactionHelper', () => {
  describe('applyReactionToReactionCounts', () => {
    it('should add a new reaction when none exists', () => {
      const oldReactionCounts: ReactionCounts = {
        agree: 0,
        disagree: 0,
        unclear: 0
      };
      const oldUserReaction: UserReaction = {
        agree: false,
        disagree: false,
        unclear: false
      };
      const action: ReactionAction = {
        argumentId: '1',
        actionType: 'add',
        reactionType: 'agree'
      };

      const result = applyReactionToReactionCounts(oldReactionCounts, oldUserReaction, action);
      expect(result).toEqual({ ...oldReactionCounts, agree: 1 });
    });

    it('should remove opposing reaction when adding new one', () => {
      const oldReactionCounts: ReactionCounts = {
        agree: 1,
        disagree: 1,
        unclear: 0
      };
      const oldUserReaction: UserReaction = {
        agree: false,
        disagree: true,
        unclear: false
      };
      const action: ReactionAction = {
        argumentId: '1',
        actionType: 'add',
        reactionType: 'agree'
      };

      const result = applyReactionToReactionCounts(oldReactionCounts, oldUserReaction, action);
      expect(result).toEqual({ ...oldReactionCounts, agree: 2, disagree: 0 });
    });

    it('should remove an existing reaction', () => {
      const oldReactionCounts: ReactionCounts = {
        agree: 1,
        disagree: 0,
        unclear: 0
      };
      const oldUserReaction: UserReaction = {
        agree: true,
        disagree: false,
        unclear: false
      };
      const action: ReactionAction = {
        argumentId: '1',
        actionType: 'remove',
        reactionType: 'agree'
      };

      const result = applyReactionToReactionCounts(oldReactionCounts, oldUserReaction, action);
      expect(result).toEqual({ ...oldReactionCounts, agree: 0 });
    });

    it('should do nothing when adding a reaction that already exists', () => {
      const oldReactionCounts: ReactionCounts = {
        agree: 1,
        disagree: 0,
        unclear: 0
      };
      const oldUserReaction: UserReaction = {
        agree: true,
        disagree: false,
        unclear: false
      };
      const action: ReactionAction = {
        argumentId: '1',
        actionType: 'add',
        reactionType: 'agree'
      };

      const result = applyReactionToReactionCounts(oldReactionCounts, oldUserReaction, action);
      expect(result).toEqual(oldReactionCounts);
    });

    it('should do nothing when removing a reaction that does not exist', () => {
      const oldReactionCounts: ReactionCounts = {
        agree: 0,
        disagree: 0,
        unclear: 0
      };
      const oldUserReaction: UserReaction = {
        agree: false,
        disagree: false,
        unclear: false
      };
      const action: ReactionAction = {
        argumentId: '1',
        actionType: 'remove',
        reactionType: 'agree'
      };

      const result = applyReactionToReactionCounts(oldReactionCounts, oldUserReaction, action);
      expect(result).toEqual(oldReactionCounts);
    });

    it('should correctly handle one of each reaction type', () => {
      const oldReactionCounts: ReactionCounts = {
        agree: 0,
        disagree: 0,
        unclear: 0
      };
      const oldUserReaction: UserReaction = {
        agree: false,
        disagree: false,
        unclear: false
      };
      const actions: ReactionAction[] = [
        { argumentId: '1', actionType: 'add', reactionType: 'agree' },
        { argumentId: '1', actionType: 'add', reactionType: 'disagree' },
        { argumentId: '1', actionType: 'add', reactionType: 'unclear' }
      ];

      let result = oldReactionCounts;
      let currentUserReaction = oldUserReaction;

      // Apply each action in sequence
      actions.forEach(action => {
        result = applyReactionToReactionCounts(result, currentUserReaction, action);
        currentUserReaction = applyReactionToUserReaction(currentUserReaction, action);
      });

      expect(result).toEqual({
        agree: 0,  // Removed by disagree
        disagree: 1,
        unclear: 1
      });
    });
  });

  describe('applyReactionToUserReaction', () => {
    it('should add a new reaction', () => {
      const oldUserReaction: UserReaction = {
        agree: false,
        disagree: false,
        unclear: false
      };
      const action: ReactionAction = {
        argumentId: '1',
        actionType: 'add',
        reactionType: 'agree'
      };

      const result = applyReactionToUserReaction(oldUserReaction, action);
      expect(result).toEqual({
        ...oldUserReaction,
        agree: true
      });
    });

    it('should remove opposing reaction when adding new one', () => {
      const oldUserReaction: UserReaction = {
        agree: false,
        disagree: true,
        unclear: false
      };
      const action: ReactionAction = {
        argumentId: '1',
        actionType: 'add',
        reactionType: 'agree'
      };

      const result = applyReactionToUserReaction(oldUserReaction, action);
      expect(result).toEqual({
        agree: true,
        disagree: false,
        unclear: false
      });
    });

    it('should remove an existing reaction', () => {
      const oldUserReaction: UserReaction = {
        agree: true,
        disagree: false,
        unclear: false
      };
      const action: ReactionAction = {
        argumentId: '1',
        actionType: 'remove',
        reactionType: 'agree'
      };

      const result = applyReactionToUserReaction(oldUserReaction, action);
      expect(result).toEqual({
        agree: false,
        disagree: false,
        unclear: false
      });
    });

    it('should do nothing when adding a reaction that already exists', () => {
      const oldUserReaction: UserReaction = {
        agree: true,
        disagree: false,
        unclear: false
      };
      const action: ReactionAction = {
        argumentId: '1',
        actionType: 'add',
        reactionType: 'agree'
      };

      const result = applyReactionToUserReaction(oldUserReaction, action);
      expect(result).toEqual(oldUserReaction);
    });

    it('should do nothing when removing a reaction that does not exist', () => {
      const oldUserReaction: UserReaction = {
        agree: false,
        disagree: false,
        unclear: false
      };
      const action: ReactionAction = {
        argumentId: '1',
        actionType: 'remove',
        reactionType: 'agree'
      };

      const result = applyReactionToUserReaction(oldUserReaction, action);
      expect(result).toEqual(oldUserReaction);
    });

    it('should allow unclear reaction alongside agree/disagree', () => {
      const oldUserReaction: UserReaction = {
        agree: true,
        disagree: false,
        unclear: false
      };
      const action: ReactionAction = {
        argumentId: '1',
        actionType: 'add',
        reactionType: 'unclear'
      };

      const result = applyReactionToUserReaction(oldUserReaction, action);
      expect(result).toEqual({
        agree: true,
        disagree: false,
        unclear: true
      });
    });
  });

  describe('applyReactionActions', () => {
    it('should apply multiple actions in sequence', () => {
      const oldReactionCounts: ReactionCounts = {
        agree: 1,
        disagree: 0,
        unclear: 0
      };
      const oldUserReaction: UserReaction = {
        agree: true,
        disagree: false,
        unclear: false
      };
      const actions: ReactionAction[] = [
        { argumentId: '1', actionType: 'remove', reactionType: 'agree' },
        { argumentId: '1', actionType: 'add', reactionType: 'disagree' }
      ];

      const result = applyReactionActions(oldReactionCounts, oldUserReaction, actions);
      expect(result).toEqual({
        reactionCounts: { agree: 0, disagree: 1, unclear: 0 },
        userReaction: {
          agree: false,
          disagree: true,
          unclear: false
        }
      });
    });

    it('should handle empty action list', () => {
      const oldReactionCounts: ReactionCounts = {
        agree: 1,
        disagree: 0,
        unclear: 0
      };
      const oldUserReaction: UserReaction = {
        agree: true,
        disagree: false,
        unclear: false
      };
      const actions: ReactionAction[] = [];

      const result = applyReactionActions(oldReactionCounts, oldUserReaction, actions);
      expect(result).toEqual({
        reactionCounts: oldReactionCounts,
        userReaction: oldUserReaction
      });
    });

    it('should handle adding and removing the same reaction type', () => {
      const oldReactionCounts: ReactionCounts = {
        agree: 0,
        disagree: 0,
        unclear: 0
      };
      const oldUserReaction: UserReaction = {
        agree: false,
        disagree: false,
        unclear: false
      };
      const actions: ReactionAction[] = [
        { argumentId: '1', actionType: 'add', reactionType: 'agree' },
        { argumentId: '1', actionType: 'remove', reactionType: 'agree' },
        { argumentId: '1', actionType: 'add', reactionType: 'agree' }
      ];

      const result = applyReactionActions(oldReactionCounts, oldUserReaction, actions);
      expect(result).toEqual({
        reactionCounts: { agree: 1, disagree: 0, unclear: 0 },
        userReaction: {
          agree: true,
          disagree: false,
          unclear: false
        }
      });
    });

    it('should handle complex sequence with all reaction types', () => {
      const oldReactionCounts: ReactionCounts = {
        agree: 0,
        disagree: 0,
        unclear: 0
      };
      const oldUserReaction: UserReaction = {
        agree: false,
        disagree: false,
        unclear: false
      };
      const actions: ReactionAction[] = [
        { argumentId: '1', actionType: 'add', reactionType: 'agree' },
        { argumentId: '1', actionType: 'add', reactionType: 'unclear' },
        { argumentId: '1', actionType: 'add', reactionType: 'disagree' }, // This should remove agree
        { argumentId: '1', actionType: 'remove', reactionType: 'unclear' }
      ];

      const result = applyReactionActions(oldReactionCounts, oldUserReaction, actions);
      expect(result).toEqual({
        reactionCounts: { agree: 0, disagree: 1, unclear: 0 },
        userReaction: {
          agree: false,
          disagree: true,
          unclear: false
        }
      });
    });

    it('should handle redundant actions', () => {
      const oldReactionCounts: ReactionCounts = {
        agree: 1,
        disagree: 0,
        unclear: 0
      };
      const oldUserReaction: UserReaction = {
        agree: true,
        disagree: false,
        unclear: false
      };
      const actions: ReactionAction[] = [
        { argumentId: '1', actionType: 'add', reactionType: 'agree' }, // Already exists
        { argumentId: '1', actionType: 'remove', reactionType: 'disagree' }, // Doesn't exist
        { argumentId: '1', actionType: 'add', reactionType: 'unclear' }
      ];

      const result = applyReactionActions(oldReactionCounts, oldUserReaction, actions);
      expect(result).toEqual({
        reactionCounts: { agree: 1, disagree: 0, unclear: 1 },
        userReaction: {
          agree: true,
          disagree: false,
          unclear: true
        }
      });
    });
  });
});
