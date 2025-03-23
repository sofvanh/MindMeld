import React, { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { buttonStyles, tooltipClasses } from '../styles/defaultStyles';
import { FeedCard } from '../components/FeedCard';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAuth } from '../contexts/AuthContext';
import { Argument, UserReaction } from '../shared/types';
import { useGraphContext } from '../contexts/GraphContext';

export const FeedView: React.FC = () => {
  const { socket } = useWebSocket();
  const { loading, user } = useAuth();
  const { graphId } = useParams<{ graphId: string }>();
  const { graph } = useGraphContext();

  const [feedArguments, setFeedArguments] = useState<Argument[] | null>(null);
  const [currentArgument, setCurrentArgument] = useState<Argument | null>(null);
  const [currentUserReaction, setCurrentUserReaction] = useState<UserReaction>({});

  const hasActiveReaction = useMemo(() => {
    return Object.values(currentUserReaction).some(value => value === true);
  }, [currentUserReaction]);

  useEffect(() => {
    if (loading || !socket || !graphId) return;

    socket.emit('get feed', { graphId }, (response: any) => {
      // TODO Maybe this should be in GraphContext as well
      if (!response.success) {
        console.error('Failed to get feed:', response.error);
        return;
      }
      const args = response.data.arguments;
      setFeedArguments(args);
      setCurrentArgument(args[0]);
    });
  }, [loading, socket, user, graphId]);

  const handleNext = () => {
    if (!feedArguments || !currentArgument) return;
    const newFeedArguments = feedArguments.filter(arg => arg.id !== currentArgument.id);
    setFeedArguments(newFeedArguments);
    setCurrentArgument(newFeedArguments[0]);
  }

  useEffect(() => {
    document.title = graph?.name ? `${graph.name} - Feed - Nexus` : 'Loading feed... - Nexus';
    return () => { document.title = 'Nexus'; };
  }, [graph?.name]);

  return (
    <div className="w-full relative flex flex-col flex-grow">
      <div className="flex flex-col items-center justify-center flex-1">
        {feedArguments?.length === 0 ? (
          <div className="text-center px-4">
            <h2 className="text-xl mb-2">No statements to show</h2>
            <p><small>Statements that you haven't reacted to yet will appear here.</small></p>
            <Link to={`/graph/${graphId}`} className={buttonStyles.link}>
              View graph
            </Link>
          </div>
        ) : !currentArgument ? (
          <div className="flex items-center justify-center mb-4">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full">
            <div className="max-w-screen-md w-full px-4">
              <FeedCard
                key={currentArgument.id}
                argument={currentArgument}
                onUserReactionChange={setCurrentUserReaction}
              />
            </div>
            <button
              onClick={handleNext}
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
                ({feedArguments?.length ? feedArguments.length - 1 : 0} left)
              </small>
            </button>
          </div>
        )}
      </div>
      <small className="absolute bottom-2 left-1/2 -translate-x-1/2 w-full max-w-[600px] px-2 flex justify-center w-full text-stone-400 text-center">
        Your feed shows statements you haven't reacted to yet, prioritizing those where your vote would be most valuable. You can leave multiple reactions on each statement.
      </small>
    </div>
  );
};
