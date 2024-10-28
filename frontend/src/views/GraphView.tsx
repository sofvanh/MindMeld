import React, { useState, useEffect } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import { Graph } from '../shared/types';
import { useParams } from 'react-router-dom';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAuth } from '../contexts/AuthContext';
import { defaultButtonClasses, defaultTextFieldClasses } from '../styles/defaultStyles';


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


const GraphView: React.FC = () => {
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

  return (
    <div className="w-full h-[calc(100vh-8rem)] relative">
      <ForceGraph2D
        width={window.innerWidth}
        height={window.innerHeight - 124}
        graphData={graphData}
        nodeLabel="name"
        nodeAutoColorBy="id"
        // onNodeClick={handleNodeClick}
        enableNodeDrag={false}
      />

      {user ? (
        <form
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 w-full max-w-[600px] px-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (newArgument.trim()) {
              handleAddArgument(newArgument.trim());
              setNewArgument('');
            }
          }}
        >
          <input
            type="text"
            placeholder="Enter new argument"
            className={`${defaultTextFieldClasses} flex-1 shadow-md`}
            onChange={(e) => setNewArgument(e.target.value)}
            value={newArgument}
          />
          <button
            type="submit"
            className={`${defaultButtonClasses} shadow-md`}
          >
            Add
          </button>
        </form>
      ) : (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg">
          <p className="text-sm text-stone-400">Sign in to add arguments</p>
        </div>
      )}
    </div>
  );
};

export default GraphView;