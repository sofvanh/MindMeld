import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWebSocket } from '../contexts/WebSocketContext';

import LoadingSpinner from '../components/LoadingSpinner';
import { buttonStyles } from '../styles/defaultStyles';

interface Graph {
  id: string;
  name: string;
}

const GraphListView: React.FC = () => {
  const { socket } = useWebSocket();
  const [graphs, setGraphs] = useState<Graph[]>([]);

  useEffect(() => {
    socket?.emit('get graphs');

    socket?.on('graphs list', (graphsList: Graph[]) => {
      setGraphs(graphsList);
    });

    return () => {
      socket?.off('graphs list');
    };
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