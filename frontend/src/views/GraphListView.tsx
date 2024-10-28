import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWebSocket } from '../contexts/WebSocketContext';
import { defaultTextButtonClasses } from '../styles/defaultStyles';

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
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl mb-4">Existing Graphs</h2>
      {graphs.length === 0 ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {graphs.map((graph) => (
            <li key={graph.id} className="mb-2">
              <Link to={`/graph/${graph.id}`} className={defaultTextButtonClasses}>
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