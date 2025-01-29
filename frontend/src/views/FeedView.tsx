import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGraph } from '../hooks/useGraph';
import LoadingSpinner from '../components/LoadingSpinner';
import { buttonStyles } from '../styles/defaultStyles';
import { FeedCard } from '../components/FeedCard';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAuth } from '../contexts/AuthContext';
import { Argument } from '../shared/types';

export const FeedView: React.FC = () => {
  const { socket } = useWebSocket();
  const { loading: userLoading, user } = useAuth();
  const { graphId } = useParams<{ graphId: string }>();
  const { graph, loading } = useGraph(graphId!); // TODO We only need the graph name
  const [feedArguments, setFeedArguments] = useState<Argument[] | null>(null);
  const [currentArgument, setCurrentArgument] = useState<Argument | null>(null);

  useEffect(() => {
    if (socket && user) {
      socket.emit('get feed', { graphId }, (response: any) => {
        setFeedArguments(response.data.arguments);
        setCurrentArgument(response.data.arguments[0]);
      });
    }
  }, [socket, user]);

  const handleNext = () => {
    if (!feedArguments || !currentArgument) return;
    const newFeedArguments = feedArguments.filter(arg => arg.id !== currentArgument.id);
    setFeedArguments(newFeedArguments);
    setCurrentArgument(newFeedArguments[0]);
  }

  useEffect(() => {
    document.title = graph?.name ? `${graph.name} - feed - MindMeld` : 'Loading feed... - MindMeld';
    return () => { document.title = 'MindMeld'; };
  }, [graph?.name]);

  if (!userLoading && !user) {
    return (
      <div className="w-full h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl mb-2">Please log in to see the feed</h2>
          <Link to="/" className={buttonStyles.secondary}>
            Return home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-8rem)] relative flex flex-col">
      <div className="flex flex-col text-center">
        <h3 className="my-2">{graph?.name}</h3>
        <div className="flex justify-between px-2">
          <div className="flex items-center">
            <Link to="/" className={`${buttonStyles.secondary} !p-1 min-w-11 sm:min-w-8 min-h-11 sm:min-h-8 flex items-center justify-center`}>
              ← Home
            </Link>
          </div>
          <div className="flex items-center">
            <Link to={`/graph/${graphId}`} className={`${buttonStyles.secondary} !p-1 min-w-11 sm:min-w-8 min-h-11 sm:min-h-8 flex items-center justify-center`}>
              View graph →
            </Link>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center flex-1">
        {feedArguments?.length === 0 ? (
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
    </div>
  );
};
