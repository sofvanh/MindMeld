import React, { useEffect, useState } from 'react';
import CloseButton from './CloseButton';
import { buttonStyles, iconClasses, tooltipClasses } from '../styles/defaultStyles';
import { IoIosThumbsUp, IoIosThumbsDown } from 'react-icons/io';
import { MdOutlineQuestionMark } from "react-icons/md";
import { Argument } from '../shared/types';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAuth } from '../contexts/AuthContext';


const getScoreLabel = (score: number | undefined): string => {
  if (score === undefined) return 'unknown';
  if (score < 0.2) return 'very low';
  if (score < 0.4) return 'low';
  if (score < 0.6) return 'medium';
  if (score < 0.8) return 'high';
  return 'very high';
};

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
            className={`${tooltipClasses} !p-1 w-auto gap-0.5 ${userReactions.agree ? buttonStyles.icon.green : buttonStyles.icon.default} ${!user && 'opacity-50'}`}
          >
            <IoIosThumbsUp className={iconClasses} />
            <span className="text-xs">{reactionCounts?.agree || 0}</span>
          </button>
          <button
            data-tooltip={user ? "Disagree" : "Disagree (sign in to contribute)"}
            onClick={() => user && handleReactionClick('disagree')}
            disabled={!user}
            className={`${tooltipClasses} !p-1 w-auto gap-0.5 ${userReactions.disagree ? buttonStyles.icon.red : buttonStyles.icon.default} ${!user && 'opacity-50'}`}
          >
            <IoIosThumbsDown className={iconClasses} />
            <span className="text-xs">{reactionCounts?.disagree || 0}</span>
          </button>
          <button
            data-tooltip={user ? "Unclear" : "Unclear (sign in to contribute)"}
            onClick={() => user && handleReactionClick('unclear')}
            disabled={!user}
            className={`${tooltipClasses} !p-1 w-auto gap-0.5 ${userReactions.unclear ? buttonStyles.icon.amber : buttonStyles.icon.default} ${!user && 'opacity-50'}`}
          >
            <MdOutlineQuestionMark className={iconClasses} />
            <span className="text-xs">{reactionCounts?.unclear || 0}</span>
          </button>
        </div>
        <CloseButton onClick={onClose} />
      </div>

      <p className="mt-2 text-sm text-slate-700 flex-1">{argument.statement}</p>

      <details className="mt-2">
        <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">
          View scores
        </summary>
        <div className="flex flex-col gap-1 mt-1">
          {argument.score ? (
            <>
              <span className="text-xs text-slate-500">Consensus: {getScoreLabel(argument.score.consensus)}</span>
              <span className="text-xs text-slate-500">Fragmentation: {getScoreLabel(argument.score.fragmentation)}</span>
              <span className="text-xs text-slate-500">Clarity: {getScoreLabel(argument.score.clarity)}</span>
            </>
          ) : (
            <span className="text-xs text-slate-500">More user feedback is required to generate scores.</span>
          )}
        </div>
      </details>
    </div>
  );
};

export default NodeInfoBox;