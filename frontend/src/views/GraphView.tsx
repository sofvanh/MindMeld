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

  // TODO Would be better if the header and footer had heights defined as rem so we could use that when calculating the height here
  return (
    <div className="w-full h-[calc(100vh-124px)] flex flex-row">
      <div className="w-[400px] h-full bg-stone-50 p-4">
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
              className={`${defaultTextFieldClasses} w-full`}
              onChange={(e) => setNewArgument(e.target.value)}
              value={newArgument}
            />
            <button
              type="submit"
              className={defaultButtonClasses}
            >
              Add Argument
            </button>
          </form>
        ) : (
          <p className="text-sm text-stone-400">Sign in to add arguments</p>
        )}</div>
      <ForceGraph2D
        width={window.innerWidth - 400}
        height={window.innerHeight - 124}
        graphData={graphData}
        nodeLabel="name"
        nodeAutoColorBy="id"
        // onNodeClick={handleNodeClick}
        enableNodeDrag={false}
      />
    </div>
  );
};

export default GraphView;