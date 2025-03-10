import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWebSocket } from '../contexts/WebSocketContext';

import LoadingSpinner from '../components/LoadingSpinner';
import { buttonStyles } from '../styles/defaultStyles';
import { usePageTitle } from '../hooks/usePageTitle';

interface Graph {
  id: string;
  name: string;
}

const GraphListView: React.FC = () => {
  const { socket } = useWebSocket();
  const [graphs, setGraphs] = useState<Graph[]>([]);
  usePageTitle('All graphs');

  useEffect(() => {
    socket?.emit('get graphs', {}, (response: any) => {
      if (response.success) {
        setGraphs(response.data.graphs);
      } else {
        console.error('Failed to get graphs:', response.error);
        // TODO Don't show loading indicator if this fails
      }
    });
  }, [socket]);

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <h2>Existing Graphs</h2>
      {graphs.length === 0 ? (
        <div className="flex flex-col items-center mt-8 h-full">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <ul>
          {graphs.map((graph) => (
            <li key={graph.id} className="mb-2">
              <Link to={`/graph/${graph.id}`} className={buttonStyles.secondary}>
                {graph.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GraphListView;