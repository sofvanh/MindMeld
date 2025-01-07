import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useGraph } from '../hooks/useGraph';
import { useNodeNavigation } from '../hooks/useNodeNavigation';
import LoadingSpinner from '../components/LoadingSpinner';
import ArgumentInfoBox from '../components/ArgumentInfoBox/ArgumentInfoBox';
import GraphVisualization from '../components/GraphVisualization';
import ArgumentForm from '../components/ArgumentForm';
import { buttonStyles } from '../styles/defaultStyles';
import { Argument } from '../shared/types';
import Legend from '../components/Legend';

const GraphView: React.FC = () => {
  const { socket } = useWebSocket();
  const { user } = useAuth();
  const { graphId } = useParams<{ graphId: string }>();
  const { graph, layoutData, loading } = useGraph(graphId!);
  const [selectedArgument, setSelectedArgument] = useState<Argument | null>(null);

  const {
    selectedNodeId,
    selectedNodeIndex,
    handleNodeClick,
    handlePrevNode,
    handleNextNode,
    handleCloseNode
  } = useNodeNavigation(layoutData.nodes);

  useEffect(() => {
    if (selectedNodeId && graph) {
      const argument = graph.arguments.find(arg => arg.id === selectedNodeId);
      setSelectedArgument(argument || null);
    } else {
      setSelectedArgument(null);
    }
  }, [selectedNodeId, graph]);

  useEffect(() => {
    document.title = graph?.name ? `${graph.name} - MindMeld` : 'Loading... - MindMeld';
    return () => { document.title = 'MindMeld'; };
  }, [graph?.name]);

  const handleAddArgument = (statement: string) => {
    if (socket && user) {
      socket.emit('add argument', { graphId, statement });
    }
  };

  if (loading || !graph) {
    return <div className="flex items-center justify-center h-full mt-8">
      <LoadingSpinner size="large" />
    </div>;
  }

  return (
    <div className="w-full h-[calc(100vh-8rem)] relative">
      <div className="absolute top-4 left-4 z-10 bg-white/80 sm:px-2 sm:py-1 rounded-lg shadow-sm flex flex-col">
        <div className="flex items-center">
          <Link to="/graphs" className={`${buttonStyles.secondary} !p-1 min-w-11 sm:min-w-8 min-h-11 sm:min-h-8 flex items-center justify-center`}>
            ←
          </Link>
          <p className="text-base m-0">
            {graph.name}
            {graph.arguments.length === 0 && <span className="inline text-sm text-stone-400"> (empty)</span>}
          </p>
        </div>
        <Legend />
      </div>
      <GraphVisualization
        graph={graph}
        layoutData={layoutData}
        selectedNodeId={selectedNodeId}
        onNodeClick={handleNodeClick}
      />
      <div className="absolute bottom-0 sm:bottom-4 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] flex flex-col gap-4">
        {selectedArgument ? (
          <ArgumentInfoBox
            argument={selectedArgument}
            onClose={handleCloseNode}
            onPrevArg={handlePrevNode}
            onNextArg={handleNextNode}
            totalArgs={layoutData.nodes.length}
            currentIndex={selectedNodeIndex + 1}
          />
        ) : (
          user ? (
            <ArgumentForm onSubmit={handleAddArgument} />
          ) : (
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <p className="text-sm text-stone-400">Sign in to add arguments</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default GraphView;