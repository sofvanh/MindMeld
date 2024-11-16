import React, { useEffect, useState } from 'react';
import CloseButton from './CloseButton';
import { greenIconButtonClasses, iconClasses, redIconButtonClasses, iconButtonClasses, amberIconButtonClasses, tooltipClasses } from '../styles/defaultStyles';
import { IoIosThumbsUp, IoIosThumbsDown } from 'react-icons/io';
import { MdOutlineQuestionMark } from "react-icons/md";
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
  const [userReactions, setUserReactions] = useState(argument.userReaction || {});
  const [reactionCounts, setReactionCounts] = useState(argument.reactionCounts);

  useEffect(() => {
    setUserReactions(argument.userReaction || {});
    setReactionCounts(argument.reactionCounts);
  }, [argument]);

  const handleReactionClick = (type: 'agree' | 'disagree' | 'unclear') => {
    const newValue = !userReactions[type];
    if (newValue) {
      socket?.emit('add reaction', {
        argumentId: argument.id,
        type
      });
    } else {
      socket?.emit('remove reaction', {
        argumentId: argument.id,
        type
      });
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-start gap-4">
        <div className="flex gap-2">
          <button
            data-tooltip={user ? "Agree" : "Agree (sign in to contribute)"}
            onClick={() => user && handleReactionClick('agree')}
            disabled={!user}
            className={`${tooltipClasses} !p-1 w-auto gap-0.5 ${userReactions.agree ? greenIconButtonClasses : iconButtonClasses} ${!user && 'opacity-50'}`}
          >
            <IoIosThumbsUp className={iconClasses} />
            <span className="text-xs">{reactionCounts?.agree || 0}</span>
          </button>
          <button
            data-tooltip={user ? "Disagree" : "Disagree (sign in to contribute)"}
            onClick={() => user && handleReactionClick('disagree')}
            disabled={!user}
            className={`${tooltipClasses} !p-1 w-auto gap-0.5 ${userReactions.disagree ? redIconButtonClasses : iconButtonClasses} ${!user && 'opacity-50'}`}
          >
            <IoIosThumbsDown className={iconClasses} />
            <span className="text-xs">{reactionCounts?.disagree || 0}</span>
          </button>
          <button
            data-tooltip={user ? "Unclear" : "Unclear (sign in to contribute)"}
            onClick={() => user && handleReactionClick('unclear')}
            disabled={!user}
            className={`${tooltipClasses} !p-1 w-auto gap-0.5 ${userReactions.unclear ? amberIconButtonClasses : iconButtonClasses} ${!user && 'opacity-50'}`}
          >
            <MdOutlineQuestionMark className={iconClasses} />
            <span className="text-xs">{reactionCounts?.unclear || 0}</span>
          </button>
        </div>
        <CloseButton onClick={onClose} />
      </div>
      <p className="text-sm text-slate-700 flex-1">{argument.statement}</p>
    </div>
  );
};

export default NodeInfoBox;