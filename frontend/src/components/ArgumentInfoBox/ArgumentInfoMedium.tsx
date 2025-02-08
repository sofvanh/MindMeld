import React, { useEffect, useState } from 'react';
import { buttonStyles, iconClasses, tooltipClasses } from '../../styles/defaultStyles';
import { IoIosThumbsUp, IoIosThumbsDown } from 'react-icons/io';
import { MdOutlineQuestionMark } from "react-icons/md";
import { Argument } from '../../shared/types';
import { useAuth } from '../../contexts/AuthContext';


interface ArgumentInfoMediumProps {
  argument: Argument;
  handleReaction: (type: 'agree' | 'disagree' | 'unclear') => void;
  onPrevArg: () => void;
  onNextArg: () => void;
  totalArgs: number;
  currentIndex: number;
}

const ArgumentInfoMedium: React.FC<ArgumentInfoMediumProps> = ({
  argument,
  handleReaction,
  onPrevArg,
  onNextArg,
  totalArgs,
  currentIndex
}) => {
  const { user } = useAuth();
  const [userReactions, setUserReactions] = useState(argument.userReaction || {});
  const [reactionCounts, setReactionCounts] = useState(argument.reactionCounts);

  useEffect(() => {
    setUserReactions(argument.userReaction || {});
    setReactionCounts(argument.reactionCounts);
  }, [argument]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border">
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevArg}
            className={`${buttonStyles.icon.default} ${tooltipClasses} !p-1`}
            data-tooltip="Previous statement"
            aria-label="Previous statement"
          >
            ←
          </button>
          <span className="text-xs text-stone-500 w-12 text-center">
            {currentIndex} / {totalArgs}
          </span>
          <button
            onClick={onNextArg}
            className={`${buttonStyles.icon.default} ${tooltipClasses} !p-1`}
            data-tooltip="Next statement"
            aria-label="Next statement"
          >
            →
          </button>
          <div className="flex gap-2">
            <button
              data-tooltip={user ? "Agree" : "Agree (sign in to contribute)"}
              onClick={() => user && handleReaction('agree')}
              disabled={!user}
              className={`${tooltipClasses} !p-1 w-auto gap-0.5 ${userReactions.agree ? buttonStyles.icon.green : buttonStyles.icon.default} ${!user && 'opacity-50'}`}
            >
              <IoIosThumbsUp className={iconClasses} />
              <span className="text-xs w-4 inline-block text-center">{reactionCounts?.agree || 0}</span>
            </button>
            <button
              data-tooltip={user ? "Disagree" : "Disagree (sign in to contribute)"}
              onClick={() => user && handleReaction('disagree')}
              disabled={!user}
              className={`${tooltipClasses} !p-1 w-auto gap-0.5 ${userReactions.disagree ? buttonStyles.icon.red : buttonStyles.icon.default} ${!user && 'opacity-50'}`}
            >
              <IoIosThumbsDown className={iconClasses} />
              <span className="text-xs w-4 inline-block text-center">{reactionCounts?.disagree || 0}</span>
            </button>
            <button
              data-tooltip={user ? "Unclear" : "Unclear (sign in to contribute)"}
              onClick={() => user && handleReaction('unclear')}
              disabled={!user}
              className={`${tooltipClasses} !p-1 w-auto gap-0.5 ${userReactions.unclear ? buttonStyles.icon.amber : buttonStyles.icon.default} ${!user && 'opacity-50'}`}
            >
              <MdOutlineQuestionMark className={iconClasses} />
              <span className="text-xs w-4 inline-block text-center">{reactionCounts?.unclear || 0}</span>
            </button>
          </div>
        </div>
      </div>

      <p className="mt-2 text-sm text-stone-700 flex-1">{argument.statement}</p>

      <details className="mt-2">
        <summary className="text-xs text-stone-500 cursor-pointer hover:text-stone-700">
          View scores
        </summary>
        <div className="flex flex-col gap-1 mt-1">
          {argument.score ? (
            <>
              <span className="text-xs text-stone-500">
                Consensus: {argument.score.consensus !== null && argument.score.consensus !== undefined ? Math.round(argument.score.consensus * 100) + "%" : "More data needed"}
              </span>
              <span className="text-xs text-stone-500">
                Fragmentation: {argument.score.fragmentation !== null && argument.score.fragmentation !== undefined ? Math.round(argument.score.fragmentation * 100) + "%" : "More data needed"}
              </span>
              <span className="text-xs text-stone-500">Clarity: {Math.round(argument.score.clarity * 100)}%</span>
            </>
          ) : (
            <span className="text-xs text-stone-500">More user feedback is required to generate scores.</span>
          )}
        </div>
      </details>
    </div>
  );
};

export default ArgumentInfoMedium;
