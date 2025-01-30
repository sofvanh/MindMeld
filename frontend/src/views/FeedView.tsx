import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGraph } from '../hooks/useGraph';
import LoadingSpinner from '../components/LoadingSpinner';
import { buttonStyles } from '../styles/defaultStyles';
import { FeedCard } from '../components/FeedCard';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAuth } from '../contexts/AuthContext';
import { Argument } from '../shared/types';
import ViewSelector from '../components/ViewSelector';
import SignInOutButton from '../components/SignInOutButton';


const feedCache: Record<string, Argument[]> = {};

export const FeedView: React.FC = () => {
  const { socket } = useWebSocket();
  const { loading: userLoading, user } = useAuth();
  const { graphId } = useParams<{ graphId: string }>();
  const { graph, loading } = useGraph(graphId!);

  const [feedArguments, setFeedArguments] = useState<Argument[] | null>(() =>
    graphId ? feedCache[graphId] || null : null
  );
  const [currentArgument, setCurrentArgument] = useState<Argument | null>(() =>
    graphId && feedCache[graphId] ? feedCache[graphId][0] : null
  );

  useEffect(() => {
    if (socket && user && graphId) {
      // If we have cached data, use it immediately
      if (feedCache[graphId]) {
        setFeedArguments(feedCache[graphId]);
        setCurrentArgument(feedCache[graphId][0]);
        return;
      }

      socket.emit('get feed', { graphId }, (response: any) => {
        const args = response.data.arguments;
        feedCache[graphId] = args;
        setFeedArguments(args);
        setCurrentArgument(args[0]);
      });
    }
  }, [socket, user, graphId]);

  const handleNext = () => {
    if (!feedArguments || !currentArgument || !graphId) return;
    const newFeedArguments = feedArguments.filter(arg => arg.id !== currentArgument.id);
    feedCache[graphId] = newFeedArguments;
    setFeedArguments(newFeedArguments);
    setCurrentArgument(newFeedArguments[0]);
  }

  useEffect(() => {
    document.title = graph?.name ? `${graph.name} - feed - MindMeld` : 'Loading feed... - MindMeld';
    return () => { document.title = 'MindMeld'; };
  }, [graph?.name]);

  return (
    <div className="w-full h-[calc(100vh-8rem)] relative flex flex-col">
      <div className="flex flex-col text-center">
        <h3 className="my-2">{graph?.name}</h3>
        <div className="flex justify-between px-2">
          <div className="flex items-center">
            <Link to="/" className={`${buttonStyles.link} !p-1 min-w-11 sm:min-w-8 min-h-11 sm:min-h-8 flex items-center justify-center`}>
              ← Home
            </Link>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center flex-1">
        {!userLoading && !user ? (
          <div className="text-center flex flex-col items-center justify-center">
            <h2 className="text-xl mb-2">Please log in to see the feed</h2>
            <SignInOutButton />
          </div>
        ) : feedArguments?.length === 0 ? (
          <div className="text-center">
            <h2 className="text-xl mb-2">No arguments to show</h2>
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
              />
            </div>
            <button
              onClick={handleNext}
              className={`${buttonStyles.secondary} mt-4`}>
              Next <span className="font-normal text-stone-500 text-sm">({feedArguments?.length ? feedArguments.length - 1 : 0} left)</span>
            </button>
          </div>
        )}
      </div>
      <ViewSelector graphId={graphId || ""} currentView="feed" />
    </div>
  );
};
