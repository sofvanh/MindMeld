import React, { useEffect, useState } from 'react';
import { buttonStyles, iconClasses, tooltipClasses } from '../../styles/defaultStyles';
import { IoIosThumbsUp, IoIosThumbsDown, IoIosWarning } from 'react-icons/io';
import { Argument } from '../../shared/types';
import { useAuth } from '../../contexts/AuthContext';


// TODO How should we show scores here?

interface ArgumentInfoSmallProps {
  argument: Argument;
  handleReaction: (type: 'agree' | 'disagree' | 'unclear') => void;
  onPrevArg: () => void;
  onNextArg: () => void;
  totalArgs: number;
  currentIndex: number;
}

const ArgumentInfoSmall: React.FC<ArgumentInfoSmallProps> = ({
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
    <div className="bg-white px-4 rounded-lg shadow-md border h-52 flex flex-col">
      <div className="flex-0 flex items-start gap-4 pr-8">
        <button
          data-tooltip={user ? "Agree" : "Agree (sign in to contribute)"}
          onClick={() => user && handleReaction('agree')}
          disabled={!user}
          className={`${tooltipClasses} !p-1 gap-0.5 ${userReactions.agree ? buttonStyles.icon.green : buttonStyles.icon.default} ${!user && 'opacity-50'} min-h-11 !w-11`}
        >
          <IoIosThumbsUp className={`${iconClasses} max-w-5`} />
          <span className="text-xs w-4 inline-block text-center">{reactionCounts?.agree || 0}</span>
        </button>
        <button
          data-tooltip={user ? "Disagree" : "Disagree (sign in to contribute)"}
          onClick={() => user && handleReaction('disagree')}
          disabled={!user}
          className={`${tooltipClasses} !p-1 !w-11 gap-0.5 ${userReactions.disagree ? buttonStyles.icon.red : buttonStyles.icon.default} ${!user && 'opacity-50'} min-h-11`}
        >
          <IoIosThumbsDown className={`${iconClasses} max-w-5`} />
          <span className="text-xs w-4 inline-block text-center">{reactionCounts?.disagree || 0}</span>
        </button>
        <button
          data-tooltip={user ? "Low quality" : "Low quality (sign in to contribute)"}
          onClick={() => user && handleReaction('unclear')}
          disabled={!user}
          className={`${tooltipClasses} !p-1 !w-11 gap-0.5 ${userReactions.unclear ? buttonStyles.icon.amber : buttonStyles.icon.default} ${!user && 'opacity-50'} min-h-11`}
        >
          <IoIosWarning className={`${iconClasses} max-w-5`} />
          <span className="text-xs w-4 inline-block text-center">{reactionCounts?.unclear || 0}</span>
        </button>
      </div >

      <div className="text-sm text-stone-700 flex-1 overflow-auto">
        <div className="min-h-full flex items-center">
          <p className="py-2">{argument.statement}</p>
        </div>
      </div>

      <div className="flex-0 flex justify-between items-center">
        <button
          onClick={onPrevArg}
          className={`${buttonStyles.icon.default} ${tooltipClasses} !p-1 flex-grow min-h-11`}
          data-tooltip="Previous statement"
          aria-label="Previous statement"
        >
          ←
        </button>
        <span className="text-xs text-stone-500 text-center flex-grow-0 w-auto mx-2 min-w-12">
          {currentIndex} / {totalArgs}
        </span>
        <button
          onClick={onNextArg}
          className={`${buttonStyles.icon.default} ${tooltipClasses} !p-1 flex-grow min-h-11`}
          data-tooltip="Next statement"
          aria-label="Next statement"
        >
          →
        </button>
      </div>
    </div >
  );
};

export default ArgumentInfoSmall;
