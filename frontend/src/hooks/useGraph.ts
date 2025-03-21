import { useState, useEffect } from 'react';
import { Graph, ForceGraphData, NodeData, LinkData, Score, UserReaction, ReactionCounts, Argument, Edge, ReactionAction } from '../shared/types';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAuth } from '../contexts/AuthContext';
import { applyReactionActions } from '../shared/reactionHelper';

// TODO Proper caching, and not just for graph data
const graphCache: Record<string, Graph> = {};
const loadingGraphs: Set<string> = new Set();
const subscribers: Record<string, ((graph: Graph) => void)[]> = {};

export interface UseGraphResult {
  graph: Graph | null;
  layoutData: ForceGraphData;
  loading: boolean;
}

export function useGraph(graphId: string) {
  const { socket } = useWebSocket();
  const { user } = useAuth();
  const [serverGraph, setServerGraph] = useState<Graph | null>(() => graphCache[graphId] || null);
  const [pendingReactions, setPendingReactions] = useState<ReactionAction[]>([]);
  const [graph, setGraph] = useState<Graph | null>(null);
  const [layoutData, setLayoutData] = useState<ForceGraphData>({ nodes: [], links: [] });

  const addPendingReaction = (reaction: ReactionAction) => {
    setPendingReactions(prev => [...prev, reaction]);
  }

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
  }

  const applyPendingReactions = (argument: Argument, reactions: ReactionAction[]) => {
    const oldReactionCounts: ReactionCounts = argument.reactionCounts || { agree: 0, disagree: 0, unclear: 0 };
    const oldUserReactions: UserReaction = argument.userReaction || { agree: false, disagree: false, unclear: false };
    const { reactionCounts, userReaction } = applyReactionActions(oldReactionCounts, oldUserReactions, reactions);
    return {
      ...argument,
      reactionCounts,
      userReaction
    }
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
    socket?.emit('join graph', { graphId }, (response: any) => {
      // TODO This is hacky and basically just for the user reactions - they need to be updated on login and logout
      if (response.success) {
        graphCache[graphId] = response.data.graph;
        setServerGraph(response.data.graph);
        subscribers[graphId]?.forEach(callback => callback(response.data.graph));
      } else {
        console.error('Failed to join graph:', response.error);
      }
    });
  }, [user, socket, graphId]);

  useEffect(() => {
    if (!socket) return;

    // If already loading, just subscribe to updates
    if (loadingGraphs.has(graphId)) {
      if (!subscribers[graphId]) {
        subscribers[graphId] = [];
      }
      subscribers[graphId].push(setServerGraph);
      return;
    }

    loadingGraphs.add(graphId);
    const startTime = performance.now();

    socket.emit('join graph', { graphId }, (response: any) => {
      if (response.success) {
        graphCache[graphId] = response.data.graph;
        setServerGraph(response.data.graph);
        // Notify all subscribers
        subscribers[graphId]?.forEach(callback => callback(response.data.graph));
      } else {
        console.error('Failed to join graph:', response.error);
      }
      loadingGraphs.delete(graphId);
      const duration = ((performance.now() - startTime) / 1000).toFixed(3);
      console.log(`Graph loaded in ${duration}s`);
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
      // Clean up subscriber when component unmounts
      if (subscribers[graphId]) {
        subscribers[graphId] = subscribers[graphId].filter(cb => cb !== setServerGraph);
      }
      // Only leave graph if no more subscribers
      if (!subscribers[graphId]?.length) {
        socket?.emit('leave graph', { graphId }, (response: any) => {
          if (!response.success) {
            console.error('Failed to leave graph:', response.error);
          }
          delete graphCache[graphId];
          delete subscribers[graphId];
        });
      }
      socket?.off('graph update');
      socket?.off('arguments added');
      socket?.off('user reactions update');
      socket?.off('graph reactions and scores update');
    }
  }, [socket, graphId]);

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

  return {
    graph,
    layoutData,
    loading: !graph,
    addPendingReaction,
    removePendingReaction
  };
}
