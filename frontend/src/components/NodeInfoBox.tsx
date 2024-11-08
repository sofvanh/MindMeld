import React, { useEffect, useState } from 'react';
import CloseButton from './CloseButton';
import { greenIconButtonClasses, iconClasses, redIconButtonClasses } from '../styles/defaultStyles';
import { iconButtonClasses } from '../styles/defaultStyles';
import { IoIosThumbsUp, IoIosThumbsDown } from 'react-icons/io';
import { Argument } from '../shared/types';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAuth } from '../contexts/AuthContext';

interface NodeInfoBoxProps {
  argument: Argument;
  onClose: () => void;
}

const NodeInfoBox: React.FC<NodeInfoBoxProps> = ({ argument, onClose }) => {
  const { socket } = useWebSocket();
  const { user } = useAuth();
  const [userReaction, setUserReaction] = useState(argument.userReaction);
  const [reactionCounts, setReactionCounts] = useState(argument.reactionCounts);

  useEffect(() => {
    setUserReaction(argument.userReaction);
    setReactionCounts(argument.reactionCounts);
  }, [argument]);

  const handleReactionClick = (reaction: 'agree' | 'disagree') => {
    if (userReaction === reaction) {
      socket?.emit('remove reaction', {
        argumentId: argument.id,
        type: reaction
      });
    } else {
      socket?.emit('add reaction', {
        argumentId: argument.id,
        type: reaction
      });
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-start gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => user && handleReactionClick('agree')}
            disabled={!user}
            className={`!p-1 w-auto gap-0.5 ${userReaction === 'agree' ? greenIconButtonClasses : iconButtonClasses} ${!user && 'opacity-50 pointer-events-none'}`}
          >
            <IoIosThumbsUp className={iconClasses} />
            <span className="text-xs">{reactionCounts?.agree || 0}</span>
          </button>
          <button
            onClick={() => user && handleReactionClick('disagree')}
            disabled={!user}
            className={`!p-1 w-auto gap-0.5 ${userReaction === 'disagree' ? redIconButtonClasses : iconButtonClasses} ${!user && 'opacity-50 pointer-events-none'}`}
          >
            <IoIosThumbsDown className={iconClasses} />
            <span className="text-xs">{reactionCounts?.disagree || 0}</span>
          </button>
        </div>
        <CloseButton onClick={onClose} />
      </div>
      <p className="text-sm text-stone-700 flex-1">{argument.statement}</p>
    </div>
  );
};

export default NodeInfoBox;