import React, { useState, useEffect } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import { Graph } from '../shared/types';
import { useParams } from 'react-router-dom';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAuth } from '../contexts/AuthContext';


interface ForceGraphData {
  nodes: {
    id: string;
    name: string;
  }[];
  links: {
    source: string;
    target: string;
  }[];
}


const ArgumentMap: React.FC = () => {
  const { socket } = useWebSocket();
  const { user } = useAuth();
  const { graphId } = useParams<{ graphId: string }>();
  const [newArgument, setNewArgument] = useState('');
  const [graph, setGraph] = useState<Graph | null>(null);
  const [graphData, setGraphData] = useState<ForceGraphData>({ nodes: [], links: [] });

  useEffect(() => {
    socket?.emit('join graph', graphId);
    socket?.on('graph data', setGraph);
    socket?.on('graph update', setGraph);

    return () => {
      socket?.off('graph update');
    }
  }, [socket, graphId])

  useEffect(() => {
    if (graph) {
      const nodes = graph.arguments.map(arg => ({ id: arg.id, name: arg.statement }));
      const links = graph.edges.map(edge => ({ source: edge.sourceId, target: edge.targetId }));
      setGraphData({ nodes, links });
    }
  }, [graph]);

  const handleAddArgument = (statement: string) => {
    if (socket && user) {
      socket.emit('add argument', { graphId, statement });
    }
  };

  if (!graph) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  // TODO Would be better if the header and footer had heights defined as rem so we could use that when calculating the height here
  return (
    <div className="w-full h-[calc(100vh-124px)] flex flex-row">
      <div className="w-[400px] h-full bg-gray-100 p-4">
        {user ? (
          <form onSubmit={(e) => {
            e.preventDefault();
            if (newArgument.trim()) {
              handleAddArgument(newArgument.trim());
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
        ) : (
          <button
            // onClick={() => signIn()}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-serif font-thin py-2 px-4 rounded"
          >
            Sign in to add arguments
          </button>
        )}</div>
      <ForceGraph2D
        width={window.innerWidth - 400}
        height={600}
        graphData={graphData}
        nodeLabel="name"
        nodeAutoColorBy="id"
        // onNodeClick={handleNodeClick}
        enableNodeDrag={false}
      />
    </div>
  );
};

export default ArgumentMap;