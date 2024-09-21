import React, { useCallback, useState, useEffect } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import io from 'socket.io-client';

interface Node {
  id: string;
  name: string;
  val: number;
}

interface Link {
  source: string;
  target: string;
  strength?: number;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
console.log('Attempting to connect to backend at:', backendUrl);
const socket = io(backendUrl);

const ArgumentMap: React.FC = () => {
  const [newArgument, setNewArgument] = useState('');
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });

  useEffect(() => {
    console.log('Initializing socket connection');

    socket.on('connect', () => {
      console.log('Socket connected successfully');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Listen for initial graph data
    socket.on('initial graph data', (data: GraphData) => {
      setGraphData(data);
    });

    // Listen for graph updates
    socket.on('graph update', (data: GraphData) => {
      setGraphData(data);
    });

    // Request initial graph data
    socket.emit('get graph data');
    console.log('Requested initial graph data');

    return () => {
      socket.off('initial graph data');
      socket.off('graph update');
      socket.off('connect');
      socket.off('connect_error');
    };
  }, []);

  const handleNodeClick = useCallback((node: Node) => {
    console.log('Clicked node:', node);
  }, []);

  const handleAddArgument = (text: string) => {
    socket.emit('add argument', text);
  };

  return (
    <div className="w-full h-[600px] flex flex-row">
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
            className="w-full px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500"
            onChange={(e) => setNewArgument(e.target.value)}
            value={newArgument}
          />
          <button
            type="submit"
            className="mt-2 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Argument
          </button>
        </form>
      </div>
      <ForceGraph2D
        width={window.innerWidth - 400}
        height={600}
        graphData={graphData}
        nodeLabel="name"
        nodeAutoColorBy="id"
        onNodeClick={handleNodeClick}
        enableNodeDrag={false}
      />
    </div>
  );
};

export default ArgumentMap;