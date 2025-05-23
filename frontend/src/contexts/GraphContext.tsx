import React, { createContext, useContext, useState, useEffect } from 'react';
import { Graph, ForceGraphData, NodeData, LinkData, ReactionAction, UserReaction, ReactionCounts, Argument, Edge, Score, Analysis } from '../shared/types';
import { useWebSocket } from './WebSocketContext';
import { useAuth } from './AuthContext';
import { applyReactionActions } from '../shared/reactionHelper';

interface GraphContextType {
  graph: Graph | null;
  layoutData: ForceGraphData;
  feed: Argument[] | null;
  analysis: Analysis | null;
  loading: boolean;
  error: string | null;
  addPendingReaction: (reaction: ReactionAction) => void;
  removePendingReaction: (reaction: ReactionAction) => void;
  onNextFeedArgument: () => void;
}

const GraphContext = createContext<GraphContextType | null>(null);

export const useGraphContext = () => {
  const context = useContext(GraphContext);
  if (!context) {
    throw new Error('useGraphContext must be used within a GraphProvider');
  }
  return context;
};

interface GraphProviderProps {
  children: React.ReactNode;
  graphId: string;
}

export const GraphProvider: React.FC<GraphProviderProps> = ({ children, graphId }) => {
  const { socket } = useWebSocket();
  const { user, loading: userLoading } = useAuth();
  const [serverGraph, setServerGraph] = useState<Graph | null>(null);
  const [pendingReactions, setPendingReactions] = useState<ReactionAction[]>([]);
  const [graph, setGraph] = useState<Graph | null>(null);
  const [layoutData, setLayoutData] = useState<ForceGraphData>({ nodes: [], links: [] });
  const [feed, setFeed] = useState<Argument[] | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const addPendingReaction = (reaction: ReactionAction) => {
    setPendingReactions(prev => [...prev, reaction]);
  };

  const removePendingReaction = (reaction: ReactionAction) => {
    setPendingReactions(prev => {
      const index = prev.findIndex(r =>
        r.argumentId === reaction.argumentId &&
        r.reactionType === reaction.reactionType &&
        r.actionType === reaction.actionType
      );
      if (index === -1) return prev;
      return [...prev.slice(0, index), ...prev.slice(index + 1)];
    });
  };

  const applyPendingReactions = (argument: Argument, reactions: ReactionAction[]) => {
    const oldReactionCounts: ReactionCounts = argument.reactionCounts || { agree: 0, disagree: 0, unclear: 0 };
    const oldUserReactions: UserReaction = argument.userReaction || { agree: false, disagree: false, unclear: false };
    const { reactionCounts, userReaction } = applyReactionActions(oldReactionCounts, oldUserReactions, reactions);
    return {
      ...argument,
      reactionCounts,
      userReaction
    };
  };

  const onNextFeedArgument = () => {
    if (!feed || feed.length === 0) return;
    const newFeedArguments = feed.slice(1);
    setFeed(newFeedArguments);
  }

  useEffect(() => {
    if (!serverGraph || Object.keys(pendingReactions).length === 0) {
      setGraph(serverGraph);
      return;
    }

    const updatedArguments = serverGraph.arguments.map(arg => {
      const pendingReaction = pendingReactions.filter(reaction => reaction.argumentId === arg.id);
      if (!pendingReaction.length) return arg;
      const { reactionCounts, userReaction } = applyPendingReactions(arg, pendingReaction);

      return {
        ...arg,
        reactionCounts,
        userReaction
      };
    });

    setGraph({
      ...serverGraph,
      arguments: updatedArguments
    });
  }, [serverGraph, pendingReactions]);

  useEffect(() => {
    if (!socket || userLoading) return;

    socket.emit('join graph', { graphId }, (response: any) => {
      if (response.success) {
        setServerGraph(response.data.graph);
      } else {
        console.error('Failed to join graph:', response.error);
        setError(response.error);
      }
    });

    // TODO Getting feed and analysis should happen within join graph
    socket.emit('get feed', { graphId }, (response: any) => {
      if (response.success) {
        setFeed(response.data.arguments);
      } else {
        console.error('Failed to get feed:', response.error);
        setError(response.error);
      }
    });

    socket.emit('get analysis', { graphId }, (response: any) => {
      if (response.success) {
        setAnalysis(response.data.analysis);
      } else {
        console.error('Failed to get analysis:', response.error);
        setError(response.error);
      }
    });

    socket.on('graph update', setServerGraph);
    socket.on('arguments added', ({ newArguments, allGraphEdges }: { newArguments: Argument[], allGraphEdges: Edge[] }) => {
      setServerGraph(prevGraph => {
        if (!prevGraph) return prevGraph;
        return { ...prevGraph, arguments: [...prevGraph.arguments, ...newArguments], edges: allGraphEdges };
      });
    });
    socket.on('user reactions update', ({ argumentIdToUserReaction }: { argumentIdToUserReaction: Record<string, UserReaction> }) => {
      setServerGraph(prevGraph => {
        if (!prevGraph) return prevGraph;
        const updatedArguments = prevGraph.arguments.map(arg => {
          const userReaction = argumentIdToUserReaction[arg.id];
          return userReaction ? { ...arg, userReaction } : arg;
        });
        return { ...prevGraph, arguments: updatedArguments };
      });
    });
    socket.on('graph reactions and scores update', ({ graphReactions, argumentScores }: { graphReactions: Record<string, ReactionCounts>, argumentScores: Record<string, Score> }) => {
      setServerGraph(prevGraph => {
        if (!prevGraph) return prevGraph;
        const updatedArguments: Argument[] = prevGraph.arguments.map(arg => ({
          ...arg,
          reactionCounts: graphReactions[arg.id],
          score: argumentScores[arg.id]
        }));
        return { ...prevGraph, arguments: updatedArguments };
      });
    });

    return () => {
      socket.emit('leave graph', { graphId }, (response: any) => {
        if (!response.success) {
          console.error('Failed to leave graph:', response.error);
          setError(response.error);
        }
      });
      socket.off('graph update');
      socket.off('arguments added');
      socket.off('user reactions update');
      socket.off('graph reactions and scores update');
    };
  }, [socket, graphId, user, userLoading]);

  useEffect(() => {
    if (!graph) return;
    const newArguments: NodeData[] = graph.arguments.map(arg => ({ id: arg.id, name: arg.statement }));
    const newLinks: LinkData[] = graph.edges.map(edge => ({
      source: newArguments.find(arg => arg.id === edge.sourceId) as NodeData,
      target: newArguments.find(arg => arg.id === edge.targetId) as NodeData
    }));
    const hasNodesChanged = newArguments.map(node => node.id).sort().join(',') !== layoutData.nodes.map(node => node.id).sort().join(',');
    const hasLinksChanged = newLinks.map(link => `${link.source}-${link.target}`).sort().join(',') !== layoutData.links.map(link => `${link.source}-${link.target}`).sort().join(',');

    if (hasNodesChanged || hasLinksChanged) {
      setLayoutData({ nodes: newArguments, links: newLinks });
    }
  }, [graph, layoutData.nodes, layoutData.links]);

  const value = {
    graph,
    layoutData,
    feed,
    analysis,
    loading: !graph || !analysis || !feed,
    error,
    addPendingReaction,
    removePendingReaction,
    onNextFeedArgument
  };

  return (
    <GraphContext.Provider value={value}>
      {children}
    </GraphContext.Provider>
  );
};
