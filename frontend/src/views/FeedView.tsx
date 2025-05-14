import React, { useEffect, useState, useMemo } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { buttonStyles, tooltipClasses } from '../styles/defaultStyles';
import { FeedCard } from '../components/FeedCard';
import { UserReaction } from '../shared/types';
import { useGraphContext } from '../contexts/GraphContext';
import ErrorMessage from '../components/ErrorMessage';


export const FeedView: React.FC = () => {
  const { graph, feed, loading, error, onNextFeedArgument } = useGraphContext();
  const [currentUserReaction, setCurrentUserReaction] = useState<UserReaction>({});

  const hasActiveReaction = useMemo(() => {
    return Object.values(currentUserReaction).some(value => value === true);
  }, [currentUserReaction]);

  useEffect(() => {
    document.title = graph?.name ? `${graph.name} - Feed - Nexus` : 'Loading feed... - Nexus';
    return () => { document.title = 'Nexus'; };
  }, [graph?.name]);

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (loading) {
    return (
      <div className="flex flex-col flex-grow text-center items-center justify-center px-4">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!feed) {
    return (
      <ErrorMessage
        title="Feed Not Available"
        message="We couldn't load the feed for this graph. Please try again later."
      />
    );
  }

  if (feed?.length === 0) {
    return (
      <div className="flex flex-col flex-grow text-center items-center justify-center px-4">
        <h2 className="text-xl mb-2">No statements to show</h2>
        <p><small>Statements that you haven't reacted to yet will appear here.</small></p>
      </div>
    );
  }

  return (
    <div className="w-full relative flex flex-col flex-grow">
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="flex flex-col items-center justify-center w-full">
          <div className="max-w-screen-md w-full px-4">
            <FeedCard
              key={feed[0].id}
              argument={feed[0]}
              onUserReactionChange={setCurrentUserReaction}
            />
          </div>
          <button
            onClick={onNextFeedArgument}
            data-tooltip={hasActiveReaction
              ? "Move to next statement"
              : "This card will return to your feed later"}
            className={`
                mt-4
                ${buttonStyles.secondary}
                ${tooltipClasses}
                ${hasActiveReaction
                ? '!bg-emerald-500 !text-white hover:!bg-emerald-600'
                : 'hover:bg-stone-100'
              }
                `}>
            {hasActiveReaction ? 'Next ' : 'Skip '}
            <small className={`
                font-normal
                ${hasActiveReaction
                ? 'text-white/90'
                : 'text-stone-500'}
                `}>
              ({feed.length - 1} left)
            </small>
          </button>
        </div>
      </div>
      <small className="absolute bottom-2 left-1/2 -translate-x-1/2 w-full max-w-[600px] px-2 flex justify-center w-full text-stone-400 text-center">
        Your feed shows statements you haven't reacted to yet, prioritizing those where your vote would be most valuable. You can leave multiple reactions on each statement.
      </small>
    </div>
  );
};
