import { useState, useEffect } from 'react';
import { Graph, ForceGraphData, NodeData, LinkData, Score, UserReaction, ReactionCounts } from '../shared/types';
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
    socket?.emit('join graph', graphId);
    socket?.on('graph data', setGraph);
    socket?.on('graph update', setGraph);
    socket?.on('argument added', ({ argument, newEdges }) => {
      setGraph(prevGraph => {
        if (!prevGraph) return prevGraph;
        return { ...prevGraph, arguments: [...prevGraph.arguments, argument], edges: newEdges };
      });
    });
    socket?.on('user reaction update', ({ argumentId, userReaction }: { argumentId: string, userReaction: UserReaction }) => {
      setGraph(prevGraph => {
        if (!prevGraph) return prevGraph;
        const updatedArguments = prevGraph.arguments.map(arg =>
          arg.id === argumentId ? { ...arg, userReaction } : arg
        );
        return { ...prevGraph, arguments: updatedArguments };
      });
    });
    socket?.on('argument reactions update', ({ argumentId, reactionCounts }: { argumentId: string, reactionCounts: ReactionCounts }) => {
      setGraph(prevGraph => {
        if (!prevGraph) return prevGraph;
        const updatedArguments = prevGraph.arguments.map(arg =>
          arg.id === argumentId ? { ...arg, reactionCounts } : arg
        );
        return { ...prevGraph, arguments: updatedArguments };
      });
    });
    socket?.on('graph scores update', (newScores: { [key: string]: Score }) => {
      setGraph(prevGraph => {
        if (!prevGraph) return prevGraph;
        const updatedArguments = prevGraph.arguments.map(arg => ({
          ...arg,
          score: newScores[arg.id] || arg.score
        }));
        return { ...prevGraph, arguments: updatedArguments };
      });
    });
    return () => {
      socket?.emit('leave graph', graphId);
      socket?.off('graph data');
      socket?.off('graph update');
      socket?.off('argument added');
      socket?.off('user reaction update');
      socket?.off('argument reactions update');
      socket?.off('graph scores update');
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
