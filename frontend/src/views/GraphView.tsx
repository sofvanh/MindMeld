import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useGraph } from '../hooks/useGraph';
import { ExtendedNodeData } from '../shared/types';
import LoadingSpinner from '../components/LoadingSpinner';
import NodeInfoBox from '../components/NodeInfoBox';
import GraphVisualization from '../components/GraphVisualization';
import { buttonStyles } from '../styles/defaultStyles';
import { getColor } from '../utils/colors';


const GraphView: React.FC = () => {
  const { socket } = useWebSocket();
  const { user } = useAuth();
  const { graphId } = useParams<{ graphId: string }>();
  const { graph, layoutData, loading } = useGraph(graphId!);

  const [newArgument, setNewArgument] = useState('');
  const [selectedNode, setSelectedNode] = useState<ExtendedNodeData | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(0);

  useEffect(() => {
    document.title = graph?.name ? `${graph.name} - MindMeld` : 'Loading... - MindMeld';
    return () => {
      document.title = 'MindMeld';
    };
  }, [graph?.name]);

  useEffect(() => {
    if (graph && selectedNodeId) {
      const selectedNode = graph.arguments.find(arg => arg.id === selectedNodeId);
      if (selectedNode) {
        setSelectedNode({
          id: selectedNode.id,
          name: selectedNode.statement,
          color: getColor(selectedNode),
          argument: selectedNode
        });
      }
    } else {
      setSelectedNode(null);
    }
  }, [graph, selectedNodeId]);

  const handleAddArgument = (statement: string) => {
    if (socket && user) {
      socket.emit('add argument', { graphId, statement });
    }
  };

  const handlePrevNode = () => {
    if (!layoutData.nodes.length) return;
    const newIndex = selectedNodeIndex > 0
      ? selectedNodeIndex - 1
      : layoutData.nodes.length - 1;
    setSelectedNodeIndex(newIndex);
    setSelectedNodeId(layoutData.nodes[newIndex].id);
  };

  const handleNextNode = () => {
    if (!layoutData.nodes.length) return;
    const newIndex = (selectedNodeIndex + 1) % layoutData.nodes.length;
    setSelectedNodeIndex(newIndex);
    setSelectedNodeId(layoutData.nodes[newIndex].id);
  };

  const handleNodeClick = (node: any) => {
    const index = layoutData.nodes.findIndex(n => n.id === node.id);
    setSelectedNodeIndex(index);
    setSelectedNodeId(node.id);
  };

  if (!graph) {
    return <div className="flex items-center justify-center h-full mt-8">
      <LoadingSpinner size="large" />
    </div>;
  }

  return (
    <div className="w-full h-[calc(100vh-8rem)] relative">
      <div className="absolute top-4 left-4 z-10 bg-white/80 px-2 py-1 rounded-lg shadow-sm flex items-center gap-2">
        <Link to="/graphs" className={`${buttonStyles.secondary} !p-1 min-w-8 flex items-center justify-center`}>
          ←
        </Link>
        <p className="text-base m-0">
          {graph.name}
          {graph.arguments.length === 0 && <p className="inline text-sm text-slate-400"> (empty)</p>}
        </p>
      </div>
      <GraphVisualization
        graph={graph!}
        layoutData={layoutData}
        selectedNodeId={selectedNodeId}
        onNodeClick={handleNodeClick}
      />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-[600px] flex flex-col gap-4">
        {selectedNode && (
          <NodeInfoBox
            argument={selectedNode.argument}
            onClose={() => {
              setSelectedNodeId(null);
              setSelectedNodeIndex(0);
            }}
            onPrevNode={handlePrevNode}
            onNextNode={handleNextNode}
            totalNodes={layoutData.nodes.length}
            currentIndex={selectedNodeIndex + 1}
          />
        )}
        {user ? (
          <form
            className=" flex gap-2 w-full"
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
              className="flex-1 shadow-md"
              onChange={(e) => setNewArgument(e.target.value)}
              value={newArgument}
            />
            <button
              type="submit"
              className={`${buttonStyles.primary} shadow-md`}
            >
              Add
            </button>
          </form>
        ) : (
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p className="text-sm text-slate-400">Sign in to add arguments</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphView;