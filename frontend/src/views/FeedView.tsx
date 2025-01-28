import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGraph } from '../hooks/useGraph';
import LoadingSpinner from '../components/LoadingSpinner';
import { buttonStyles } from '../styles/defaultStyles';
import { FeedCard } from '../components/FeedCard';

export const FeedView: React.FC = () => {
  const { graphId } = useParams<{ graphId: string }>();
  const { graph, loading } = useGraph(graphId!);

  useEffect(() => {
    document.title = graph?.name ? `${graph.name} - feed - MindMeld` : 'Loading feed... - MindMeld';
    return () => { document.title = 'MindMeld'; };
  }, [graph?.name]);

  return (
    <div className="w-full h-[calc(100vh-8rem)] relative">
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center">
          <Link to="/" className={`${buttonStyles.secondary} !p-1 min-w-11 sm:min-w-8 min-h-11 sm:min-h-8 flex items-center justify-center`}>
            ← Home
          </Link>
        </div>
      </div>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 sm:px-2 sm:py-1">
        <h3>{graph?.name}</h3>
      </div>
      <div className="absolute top-4 right-4 z-10">
        <div className="flex items-center">
          <Link to={`/graph/${graphId}`} className={`${buttonStyles.secondary} !p-1 min-w-11 sm:min-w-8 min-h-11 sm:min-h-8 flex items-center justify-center`}>
            → View graph
          </Link>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center h-full">
        {loading || !graph ? (
          <div className="flex items-center justify-center mb-4">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <div className="max-w-screen-md w-full px-4">
            <FeedCard statement="Deliberation is important in the modern world, and we need to do it better, and faster, and more effectively." />
          </div>
        )}
      </div>
    </div>
  );
};
