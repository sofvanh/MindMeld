import { useState, useCallback } from 'react';
import { NodeData } from '../shared/types';


export function useNodeNavigation(nodes: NodeData[]) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(0);

  const handleNodeClick = useCallback((node: NodeData) => {
    const index = nodes.findIndex(n => n.id === node.id);
    setSelectedNodeIndex(index);
    setSelectedNodeId(node.id);
  }, [nodes]);

  const handlePrevNode = useCallback(() => {
    if (!nodes.length) return;
    const newIndex = selectedNodeIndex > 0 ? selectedNodeIndex - 1 : nodes.length - 1;
    setSelectedNodeIndex(newIndex);
    setSelectedNodeId(nodes[newIndex].id);
  }, [nodes, selectedNodeIndex]);

  const handleNextNode = useCallback(() => {
    if (!nodes.length) return;
    const newIndex = (selectedNodeIndex + 1) % nodes.length;
    setSelectedNodeIndex(newIndex);
    setSelectedNodeId(nodes[newIndex].id);
  }, [nodes, selectedNodeIndex]);

  const handleCloseNode = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedNodeIndex(0);
  }, []);

  return {
    selectedNodeId,
    selectedNodeIndex,
    handleNodeClick,
    handlePrevNode,
    handleNextNode,
    handleCloseNode
  };
}