import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import { forceCollide } from 'd3-force';
import { Graph, ForceGraphData } from '../shared/types';
import { getColor } from '../utils/colors';

interface ClusterInfo {
  id: number;
  arguments: any[];
  themeLabel?: { title: string; summary: string };
}

interface GraphVisualizationProps {
  graph: Graph;
  layoutData: ForceGraphData;
  clusters: ClusterInfo[];
  clusterViewEnabled: boolean;
  selectedNodeId: string | null;
  onNodeClick: (node: any) => void;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  graph,
  layoutData,
  clusters,
  clusterViewEnabled,
  selectedNodeId,
  onNodeClick
}) => {
  const fgRef = useRef<any>();

  // Debug logging
  console.log('🎨 GraphVisualization Debug:');
  console.log('  - Clusters length:', clusters.length);
  console.log('  - Cluster view enabled:', clusterViewEnabled);
  console.log('  - Layout nodes:', layoutData.nodes.length);
  console.log('  - Nodes with cluster IDs:', layoutData.nodes.filter(n => n.clusterId !== undefined).length);
  console.log('  - Sample node:', layoutData.nodes[0]);

  // Cluster colors for backgrounds
  const clusterColors = useMemo(() => [
    'rgba(239, 68, 68, 0.15)',   // red-500
    'rgba(59, 130, 246, 0.15)',  // blue-500
    'rgba(34, 197, 94, 0.15)',   // green-500
    'rgba(168, 85, 247, 0.15)',  // purple-500
    'rgba(245, 158, 11, 0.15)',  // yellow-500
    'rgba(236, 72, 153, 0.15)',  // pink-500
    'rgba(20, 184, 166, 0.15)',  // teal-500
    'rgba(251, 146, 60, 0.15)',  // orange-500
  ], []);

  // Calculate cluster centers for force layout
  const clusterCenters = useMemo(() => {
    const centers: Record<number, { x: number; y: number }> = {};
    const numClusters = clusters.length;
    const radius = Math.min(window.innerWidth, window.innerHeight) * 0.3;

    clusters.forEach((cluster, index) => {
      const angle = (index / numClusters) * 2 * Math.PI;
      centers[cluster.id] = {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      };
    });

    return centers;
  }, [clusters]);

  useEffect(() => {
    if (!fgRef.current) return;

    fgRef.current.d3Force('charge')?.strength(-60);
    fgRef.current.d3Force('collision', forceCollide(15));
    fgRef.current.d3Force('link')?.distance(clusterViewEnabled ? 30 : 40);

    if (clusterViewEnabled && clusters.length > 0) {
      // Add cluster forces
      fgRef.current.d3Force('cluster', (alpha: number) => {
        layoutData.nodes.forEach((node: any) => {
          if (node.clusterId !== undefined && clusterCenters[node.clusterId]) {
            const center = clusterCenters[node.clusterId];
            const k = alpha * 0.1;
            node.vx += (center.x - node.x) * k;
            node.vy += (center.y - node.y) * k;
          }
        });
      });
    } else {
      fgRef.current.d3Force('cluster', null);
    }
  }, [clusterViewEnabled, clusters, clusterCenters, layoutData.nodes]);

  const nodeColors = useMemo(() => {
    return new Map(graph?.arguments?.map(arg => [arg.id, getColor(arg)]) || []);
  }, [graph?.arguments]);

  // Draw cluster backgrounds
  const drawClusterBackgrounds = useCallback((ctx: CanvasRenderingContext2D, globalScale: number) => {
    if (!clusterViewEnabled || clusters.length === 0) return;

    clusters.forEach((cluster) => {
      const clusterNodes = layoutData.nodes.filter((node: any) => node.clusterId === cluster.id);
      if (clusterNodes.length < 2) return;

      // Calculate convex hull or simple bounding circle
      const xs = clusterNodes.map((node: any) => node.x);
      const ys = clusterNodes.map((node: any) => node.y);

      const minX = Math.min(...xs) - 30;
      const maxX = Math.max(...xs) + 30;
      const minY = Math.min(...ys) - 30;
      const maxY = Math.max(...ys) + 30;

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const radius = Math.max((maxX - minX) / 2, (maxY - minY) / 2) + 20;

      // Draw background circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = clusterColors[cluster.id % clusterColors.length];
      ctx.fill();

      // Draw cluster label
      if (cluster.themeLabel?.title && globalScale > 0.6) {
        ctx.font = `${Math.max(12, 16 / globalScale)}px sans-serif`;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.textAlign = 'center';
        ctx.fillText(cluster.themeLabel.title, centerX, centerY - radius - 10 / globalScale);
      }
    });
  }, [clusterViewEnabled, clusters, layoutData.nodes, clusterColors]);

  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const radius = 5;
    const color = nodeColors.get(node.id) || '#94a3b8';

    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    if (node.id === selectedNodeId) {
      ctx.strokeStyle = color.replace(/[\d.]+\)$/, '0.375)');
      ctx.lineWidth = 8 / globalScale;
      ctx.stroke();
    }
  }, [nodeColors, selectedNodeId]);

  return (
    <ForceGraph2D
      ref={fgRef}
      width={window.innerWidth}
      height={window.innerHeight - 162}
      graphData={layoutData}
      nodeLabel="name"
      onNodeClick={onNodeClick}
      enableNodeDrag={false}
      nodeCanvasObject={nodeCanvasObject}
      nodeCanvasObjectMode={() => 'replace'}
      nodeRelSize={15}
      autoPauseRedraw={true}
      d3AlphaDecay={0.01}
      onRenderFramePre={(ctx, globalScale) => {
        drawClusterBackgrounds(ctx, globalScale);
      }}
    />
  );
};

export default GraphVisualization;
