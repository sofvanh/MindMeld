import React, { useCallback, useState, useEffect } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import io from 'socket.io-client';

import { Argument, Graph } from '../shared/types';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
console.log('Attempting to connect to backend at:', backendUrl);
const socket = io(backendUrl);

const ArgumentMap: React.FC = () => {
  const { graphId } = useParams<{ graphId: string }>();
  const [newArgument, setNewArgument] = useState('');
  const [graph, setGraph] = useState<Graph | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Initializing socket connection');
    setError(null);

    socket.on('connect', () => {
      console.log('Socket connected successfully');
      if (graphId) {
        console.log(`Joining graph ${graphId}`);
        socket.emit('join graph', graphId);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setError('Unable to connect to the server. Please try again later.');
    });

    socket.on('initial graph data', (data: Graph) => {
      if (data) {
        setGraph(data);
      } else {
        setError(`Graph with ID ${graphId} not found.`);
      }
    });

    socket.on('graph update', (data: Graph) => {
      setGraph(data);
    });

    return () => {
      socket.off('initial graph data');
      socket.off('graph update');
      socket.off('connect');
      socket.off('connect_error');
    };
  }, [graphId]);

  const handleNodeClick = useCallback((node: Argument) => {
    console.log('Clicked node:', node);
  }, [graphId]);

  const handleAddArgument = (text: string) => {
    socket.emit('add argument', { graphId, text });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-xl text-red-600 mb-4">{error}</p>
        <Link to="/" className="bg-stone-500 hover:bg-stone-700 text-white font-serif font-thin py-2 px-4 rounded">
          Return to Home
        </Link>
      </div>
    );
  }

  if (!graph) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  // TODO Would be better if the header and footer had heights defined as rem so we could use that when calculating the height here
  return (
    <div className="w-full h-[calc(100vh-112px)] flex flex-row">
      <div className="w-[400px] h-full bg-gray-100 p-4">
        <form onSubmit={(e) => {
          e.preventDefault();
          if (newArgument.trim()) {
            handleAddArgument(newArgument);
            setNewArgument('');
          }
        }}>
          <input
            type="text"
            placeholder="Enter argument..."
            className="w-full px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-stone-500 text-sm"
            onChange={(e) => setNewArgument(e.target.value)}
            value={newArgument}
          />
          <button
            type="submit"
            className="mt-2 w-full bg-stone-500 hover:bg-stone-700 text-white font-serif font-thin py-2 px-4 rounded"
          >
            Add Argument
          </button>
        </form>
      </div>
      <ForceGraph2D
        width={window.innerWidth - 400}
        height={600}
        graphData={{ nodes: graph?.arguments || [], links: graph?.edges || [] }}
        nodeLabel="name"
        nodeAutoColorBy="id"
        onNodeClick={handleNodeClick}
        enableNodeDrag={false}
      />
    </div>
  );
};

export default ArgumentMap;