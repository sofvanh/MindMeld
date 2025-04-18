import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import { forceCollide } from 'd3-force';
import { Graph, ForceGraphData } from '../shared/types';
import { getColor } from '../utils/colors';

interface GraphVisualizationProps {
  graph: Graph;
  layoutData: ForceGraphData;
  selectedNodeId: string | null;
  onNodeClick: (node: any) => void;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  graph,
  layoutData,
  selectedNodeId,
  onNodeClick
}) => {
  const fgRef = useRef<any>();

  useEffect(() => {
    fgRef.current?.d3Force('charge')?.strength(-60);
    fgRef.current?.d3Force('collision', forceCollide(15));
    fgRef.current?.d3Force('link')?.distance(40);
  }, []);

  const nodeColors = useMemo(() => {
    return new Map(graph?.arguments?.map(arg => [arg.id, getColor(arg)]) || []);
  }, [graph?.arguments]);

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
    />
  );
};

export default GraphVisualization;
