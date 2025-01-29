import { buttonStyles, iconClasses, tooltipClasses } from '../styles/defaultStyles';
import { IoIosThumbsUp, IoIosThumbsDown } from 'react-icons/io';
import { MdOutlineQuestionMark } from "react-icons/md";
import { Argument, ReactionAction, UserReaction } from '../shared/types';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useState } from 'react';
import { applyReactionToUserReaction } from '../shared/reactionHelper';

interface FeedCardProps {
  argument: Argument;
}

export const FeedCard = ({ argument }: FeedCardProps) => {
  const { socket } = useWebSocket();
  const [userReaction, setUserReaction] = useState<UserReaction>({});

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
    setUserReaction(newUserReaction);
    socket.emit(reactionAction.actionType + ' reaction', {
      graphId: argument.graphId,
      argumentId: argument.id,
      type
    }, (response: any) => {
      if (!response.success) {
        console.error('Failed to add reaction:', response.error);
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
          <IoIosThumbsUp className={`${iconClasses} max-w-4 mr-2`} /> Agree
        </button>
        <button
          className={`${buttonStyles.icon.red} ${tooltipClasses} min-h-11 w-full border-[0.5px] border-red-500 ${userReaction.disagree ? '!bg-red-200' : ''}`}
          data-tooltip="I don't agree with this"
          aria-label="Disagree"
          onClick={() => handleReactionClick('disagree')}
        >
          <IoIosThumbsDown className={`${iconClasses} max-w-4 mr-2`} /> Disagree
        </button>
        <div className="block sm:hidden"></div>
        <button
          className={`${buttonStyles.icon.default} ${tooltipClasses} min-h-11 w-full ${userReaction.unclear ? '!bg-amber-100' : ''}`}
          data-tooltip="This argument is unclear or poor quality"
          aria-label="Unclear"
          onClick={() => handleReactionClick('unclear')}
        >
          <MdOutlineQuestionMark className={`${iconClasses} max-w-4 mr-2`} /> Unclear
        </button>
      </div>
    </div >
  );
}
