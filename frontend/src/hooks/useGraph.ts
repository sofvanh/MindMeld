import { useState, useEffect } from 'react';
import { Graph, ForceGraphData, NodeData, LinkData } from '../shared/types';
import { useWebSocket } from '../contexts/WebSocketContext';

export interface UseGraphResult {
  graph: Graph | null;
  layoutData: ForceGraphData;
  loading: boolean;
}

export function useGraph(graphId: string) {
  const { socket } = useWebSocket();
  const [graph, setGraph] = useState<Graph | null>(null);
  const [layoutData, setLayoutData] = useState<ForceGraphData>({ nodes: [], links: [] });

  useEffect(() => {
    socket?.emit('join graph', graphId);
    socket?.on('graph data', setGraph);
    socket?.on('graph update', setGraph);
    return () => {
      socket?.emit('leave graph', graphId);
      socket?.off('graph data');
      socket?.off('graph update');
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
    loading: !graph
  };
}
