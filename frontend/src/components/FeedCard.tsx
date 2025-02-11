import { buttonStyles, iconClasses, tooltipClasses } from '../styles/defaultStyles';
import { IoIosThumbsUp, IoIosThumbsDown, IoIosWarning } from 'react-icons/io';
import { Argument, ReactionAction, UserReaction } from '../shared/types';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useState } from 'react';
import { applyReactionToUserReaction } from '../shared/reactionHelper';

interface FeedCardProps {
  argument: Argument;
}

const reactionCache: Record<string, UserReaction> = {};

export const FeedCard = ({ argument }: FeedCardProps) => {
  const { socket } = useWebSocket();
  const [userReaction, setUserReaction] = useState<UserReaction>(() =>
    reactionCache[argument.id] || {}
  );

  const handleReactionClick = (type: 'agree' | 'disagree' | 'unclear') => {
    if (!socket) {
      console.error('No socket found');
      return;
    }

    const isCurrentlySelected = userReaction?.[type] || false;
    const newValue = !isCurrentlySelected;
    const reactionAction: ReactionAction = {
      actionType: newValue ? 'add' : 'remove',
      reactionType: type,
      argumentId: argument.id
    };
    const newUserReaction = applyReactionToUserReaction(userReaction, reactionAction);
    reactionCache[argument.id] = newUserReaction;
    setUserReaction(newUserReaction);

    socket.emit(reactionAction.actionType + ' reaction', {
      graphId: argument.graphId,
      argumentId: argument.id,
      type
    }, (response: any) => {
      if (!response.success) {
        console.error('Failed to add reaction:', response.error);
        reactionCache[argument.id] = userReaction;
        setUserReaction(userReaction);
      }
    });
  };

  return (
    <div className="bg-white px-4 rounded-lg shadow-md border min-h-52 flex flex-col">
      <div className="text-stone-700 flex-1 overflow-auto text-center py-2 flex items-center justify-center">
        <p className="w-full">{argument.statement}</p>
      </div>
      <div className="flex-0 grid grid-cols-2 sm:grid-cols-4 gap-2 items-center justify-items-center mb-2 content-center">
        <div className="hidden sm:block"></div>
        <button
          className={`${buttonStyles.icon.green} ${tooltipClasses} min-h-11 w-full border-[0.5px] border-emerald-500 ${userReaction.agree ? '!bg-emerald-200' : ''}`}
          data-tooltip="I agree with this"
          aria-label="Agree"
          onClick={() => handleReactionClick('agree')}
        >
          <IoIosThumbsUp className={`${iconClasses} max-w-5 mr-2`} /> Agree
        </button>
        <button
          className={`${buttonStyles.icon.red} ${tooltipClasses} min-h-11 w-full border-[0.5px] border-red-500 ${userReaction.disagree ? '!bg-red-200' : ''}`}
          data-tooltip="I don't agree with this"
          aria-label="Disagree"
          onClick={() => handleReactionClick('disagree')}
        >
          <IoIosThumbsDown className={`${iconClasses} max-w-5 mr-2`} /> Disagree
        </button>
        <div className="block sm:hidden"></div>
        <button
          className={`${buttonStyles.icon.default} ${tooltipClasses} min-h-11 w-full ${userReaction.unclear ? '!bg-amber-100' : ''}`}
          data-tooltip="Contributes poorly to the conversation"
          aria-label="Low quality"
          onClick={() => handleReactionClick('unclear')}
        >
          <IoIosWarning className={`${iconClasses} max-w-5 mr-2`} /> Low quality
        </button>
      </div>
    </div >
  );
}
