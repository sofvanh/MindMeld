import React, { useState, useEffect } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import { Graph } from '../shared/types';
import { useParams } from 'react-router-dom';
import { useWebSocket } from '../contexts/WebSocketContext';


const ArgumentMap: React.FC = () => {
  const { socket } = useWebSocket();
  const { graphId } = useParams<{ graphId: string }>();
  const [newArgument, setNewArgument] = useState('');
  const [graph, setGraph] = useState<Graph | null>(null);

  useEffect(() => {
    socket?.emit('join graph', graphId);
    socket?.on('graph data', setGraph);
    socket?.on('graph update', setGraph);

    return () => {
      socket?.off('graph update');
    }
  }, [socket, graphId])

  const handleAddArgument = (statement: string) => {
    if (socket) {
      socket.emit('add argument', { graphId, statement });
    }
  };

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
      </div>
      <ForceGraph2D
        width={window.innerWidth - 400}
        height={600}
        graphData={{ nodes: graph?.arguments || [], links: graph?.edges || [] }}
        nodeLabel="name"
        nodeAutoColorBy="id"
        // onNodeClick={handleNodeClick}
        enableNodeDrag={false}
      />
    </div>
  );
};

export default ArgumentMap;