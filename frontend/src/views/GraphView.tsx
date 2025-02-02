import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useGraph } from '../hooks/useGraph';
import { useNodeNavigation } from '../hooks/useNodeNavigation';
import LoadingSpinner from '../components/LoadingSpinner';
import ArgumentInfoBox from '../components/ArgumentInfoBox/ArgumentInfoBox';
import GraphVisualization from '../components/GraphVisualization';
import ArgumentForm from '../components/ArgumentForm';
import { Argument } from '../shared/types';
import Legend from '../components/Legend';

const GraphView: React.FC = () => {
  const { socket } = useWebSocket();
  const { user } = useAuth();
  const { graphId } = useParams<{ graphId: string }>();
  const { graph, layoutData, loading, addPendingReaction, removePendingReaction } = useGraph(graphId!);
  const [selectedArgument, setSelectedArgument] = useState<Argument | null>(null);
  const [argumentsInQueue, setArgumentsInQueue] = useState<number>(0);

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
      setArgumentsInQueue(prev => prev + 1)
      socket.emit('add argument', { graphId, statement }, (response: any) => {
        setArgumentsInQueue(prev => prev - 1)
        if (!response.success) {
          console.error('Failed to add argument:', response.error);
        }
      });
    }
  };

  return (
    <div className="w-full relative flex flex-col flex-grow">
      <div className="absolute top-4 left-4 z-10 ">
        <Legend />
      </div>
      {loading || !graph ? (
        <div className="flex-grow flex items-center justify-center h-full mt-8">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <div className="flex-grow">
          <GraphVisualization
            graph={graph}
            layoutData={layoutData}
            selectedNodeId={selectedNodeId}
            onNodeClick={handleNodeClick}
          />
        </div>
      )}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-full max-w-[600px] px-2">
        {selectedArgument ? (
          <ArgumentInfoBox
            argument={selectedArgument}
            onClose={handleCloseNode}
            onPrevArg={handlePrevNode}
            onNextArg={handleNextNode}
            totalArgs={layoutData.nodes.length}
            currentIndex={selectedNodeIndex + 1}
            addPendingReaction={addPendingReaction}
            removePendingReaction={removePendingReaction}
          />
        ) : (
          user ? (
            <>
              {argumentsInQueue > 0 &&
                <p className="m-1 text-xs text-stone-400">Adding arguments ({argumentsInQueue} queued)...</p>
              }
              <ArgumentForm onSubmit={handleAddArgument} />
            </>
          ) : (
            <div className="flex justify-center w-full">
              <small className="text-stone-400">Sign in to add and react to statements</small>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default GraphView;
