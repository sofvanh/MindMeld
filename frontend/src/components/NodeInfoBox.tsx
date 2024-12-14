import React, { useEffect, useState } from 'react';
import CloseButton from './CloseButton';
import { buttonStyles, iconClasses, tooltipClasses } from '../styles/defaultStyles';
import { IoIosThumbsUp, IoIosThumbsDown } from 'react-icons/io';
import { MdOutlineQuestionMark } from "react-icons/md";
import { Argument } from '../shared/types';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAuth } from '../contexts/AuthContext';


interface NodeInfoBoxProps {
  argument: Argument;
  onClose: () => void;
  onPrevNode: () => void;
  onNextNode: () => void;
  totalNodes: number;
  currentIndex: number;
}

const NodeInfoBox: React.FC<NodeInfoBoxProps> = ({
  argument,
  onClose,
  onPrevNode,
  onNextNode,
  totalNodes,
  currentIndex
}) => {
  const { socket } = useWebSocket();
  const { user } = useAuth();
  const [userReactions, setUserReactions] = useState(argument.userReaction || {});
  const [reactionCounts, setReactionCounts] = useState(argument.reactionCounts);

  useEffect(() => {
    setUserReactions(argument.userReaction || {});
    setReactionCounts(argument.reactionCounts);
  }, [argument]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        onPrevNode();
      } else if (event.key === 'ArrowRight') {
        onNextNode();
      } else if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPrevNode, onNextNode, onClose]);

  const handleReactionClick = (type: 'agree' | 'disagree' | 'unclear') => {
    if (!socket) {
      console.error('No socket found');
      return;
    }
    const newValue = !userReactions[type];
    if (newValue) {
      socket.emit('add reaction', {
        argumentId: argument.id,
        type
      });
    } else {
      socket.emit('remove reaction', {
        argumentId: argument.id,
        type
      });
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border">
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevNode}
            className={`${buttonStyles.icon.default} ${tooltipClasses} !p-1`}
            data-tooltip="Previous argument"
            aria-label="Previous argument"
          >
            ←
          </button>
          <span className="text-xs text-slate-500 w-12 text-center">
            {currentIndex} / {totalNodes}
          </span>
          <button
            onClick={onNextNode}
            className={`${buttonStyles.icon.default} ${tooltipClasses} !p-1`}
            data-tooltip="Next argument"
            aria-label="Next argument"
          >
            →
          </button>
          <div className="flex gap-2">
            <button
              data-tooltip={user ? "Agree" : "Agree (sign in to contribute)"}
              onClick={() => user && handleReactionClick('agree')}
              disabled={!user}
              className={`${tooltipClasses} !p-1 w-auto gap-0.5 ${userReactions.agree ? buttonStyles.icon.green : buttonStyles.icon.default} ${!user && 'opacity-50'}`}
            >
              <IoIosThumbsUp className={iconClasses} />
              <span className="text-xs w-4 inline-block text-center">{reactionCounts?.agree || 0}</span>
            </button>
            <button
              data-tooltip={user ? "Disagree" : "Disagree (sign in to contribute)"}
              onClick={() => user && handleReactionClick('disagree')}
              disabled={!user}
              className={`${tooltipClasses} !p-1 w-auto gap-0.5 ${userReactions.disagree ? buttonStyles.icon.red : buttonStyles.icon.default} ${!user && 'opacity-50'}`}
            >
              <IoIosThumbsDown className={iconClasses} />
              <span className="text-xs w-4 inline-block text-center">{reactionCounts?.disagree || 0}</span>
            </button>
            <button
              data-tooltip={user ? "Unclear" : "Unclear (sign in to contribute)"}
              onClick={() => user && handleReactionClick('unclear')}
              disabled={!user}
              className={`${tooltipClasses} !p-1 w-auto gap-0.5 ${userReactions.unclear ? buttonStyles.icon.amber : buttonStyles.icon.default} ${!user && 'opacity-50'}`}
            >
              <MdOutlineQuestionMark className={iconClasses} />
              <span className="text-xs w-4 inline-block text-center">{reactionCounts?.unclear || 0}</span>
            </button>
          </div>
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
              <span className="text-xs text-slate-500">Consensus: {Math.round(argument.score.consensus * 100)}%</span>
              <span className="text-xs text-slate-500">Fragmentation: {Math.round(argument.score.fragmentation * 100)}%</span>
              <span className="text-xs text-slate-500">Clarity: {Math.round(argument.score.clarity * 100)}%</span>
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