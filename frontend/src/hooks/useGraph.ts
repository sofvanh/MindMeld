import { useState, useEffect } from 'react';
import { Graph, ForceGraphData, NodeData, LinkData, Score, UserReaction, ReactionCounts, Argument, Edge } from '../shared/types';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAuth } from '../contexts/AuthContext';

export interface UseGraphResult {
  graph: Graph | null;
  layoutData: ForceGraphData;
  loading: boolean;
}

export function useGraph(graphId: string) {
  const { socket } = useWebSocket();
  const { user } = useAuth();
  const [graph, setGraph] = useState<Graph | null>(null);
  const [layoutData, setLayoutData] = useState<ForceGraphData>({ nodes: [], links: [] });

  useEffect(() => {
    if (!socket) return;
    const startTime = performance.now();
    socket.emit('join graph', { graphId }, (response: any) => {
      if (response.success) {
        setGraph(response.data.graph);
      } else {
        console.error('Failed to join graph:', response.error);
      }
      const duration = ((performance.now() - startTime) / 1000).toFixed(3);
      console.log(`Graph loaded in ${duration}s`);
    });
    socket.on('graph update', setGraph);
    socket.on('arguments added', ({ newArguments, allGraphEdges }: { newArguments: Argument[], allGraphEdges: Edge[] }) => {
      setGraph(prevGraph => {
        if (!prevGraph) return prevGraph;
        return { ...prevGraph, arguments: [...prevGraph.arguments, ...newArguments], edges: allGraphEdges };
      });
    });
    socket.on('user reactions update', ({ argumentIdToUserReaction }: { argumentIdToUserReaction: Record<string, UserReaction> }) => {
      setGraph(prevGraph => {
        if (!prevGraph) return prevGraph;
        const updatedArguments = prevGraph.arguments.map(arg => {
          const userReaction = argumentIdToUserReaction[arg.id];
          return userReaction ? { ...arg, userReaction } : arg;
        });
        return { ...prevGraph, arguments: updatedArguments };
      });
    });
    socket.on('graph reactions and scores update', ({ graphReactions, argumentScores }: { graphReactions: Record<string, ReactionCounts>, argumentScores: Record<string, Score> }) => {
      setGraph(prevGraph => {
        if (!prevGraph) return prevGraph;
        const updatedArguments = prevGraph.arguments.map(arg => ({
          ...arg,
          reactionCounts: graphReactions[arg.id],
          score: argumentScores[arg.id]
        }));
        return { ...prevGraph, arguments: updatedArguments };
      });
    });
    return () => {
      socket?.emit('leave graph', { graphId }, (response: any) => {
        if (!response.success) {
          console.error('Failed to leave graph:', response.error);
        }
      });
      socket?.off('graph update');
      socket?.off('arguments added');
      socket?.off('user reactions update');
      socket?.off('graph reactions and scores update');
    }
  }, [socket, graphId, user]);

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
    loading: !graph
  };
}
