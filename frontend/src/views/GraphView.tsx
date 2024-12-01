import React, { useState, useEffect } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import { Argument, Graph } from '../shared/types';
import { Link, useParams } from 'react-router-dom';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import NodeInfoBox from '../components/NodeInfoBox';
import { buttonStyles } from '../styles/defaultStyles';


interface ForceGraphData {
  nodes: NodeData[];
  links: LinkData[];
}

interface NodeData {
  id: string;
  name: string;
  color: string;
  argument: Argument;
}

interface LinkData {
  source: string;
  target: string;
}

const GraphView: React.FC = () => {
  const { socket } = useWebSocket();
  const { loading, user } = useAuth();
  const { graphId } = useParams<{ graphId: string }>();
  const [newArgument, setNewArgument] = useState('');
  const [graph, setGraph] = useState<Graph | null>(null);
  const [graphData, setGraphData] = useState<ForceGraphData>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(0);

  useEffect(() => {
    if (loading) return;
    socket?.emit('join graph', graphId);
    socket?.on('graph data', setGraph);
    socket?.on('graph update', setGraph);
    return () => {
      socket?.emit('leave graph', graphId);
      socket?.off('graph data');
      socket?.off('graph update');
    }
  }, [socket, graphId, loading])

  const getColor = (arg: Argument) => {
    if (!arg.score) return '#94a3b8';
    const r = Math.round((arg.score.consensus ?? 0) * 255);
    const g = Math.round((arg.score.fragmentation ?? 0) * 255);
    const b = Math.round((1 - (arg.score.clarity ?? 0)) * 255);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  useEffect(() => {
    if (graph) {
      document.title = `${graph.name} - MindMeld`;
      const nodes: NodeData[] = graph.arguments.map(arg => {
        return {
          id: arg.id,
          name: arg.statement,
          color: getColor(arg),
          argument: arg
        } as NodeData;
      });
      const links: LinkData[] = graph.edges.map(edge => ({ source: edge.sourceId, target: edge.targetId }));
      setGraphData({ nodes, links });
    }
  }, [graph]);

  useEffect(() => {
    if (graph && selectedNodeId) {
      console.log('selectedNodeId', selectedNodeId);
      const selectedNode = graph.arguments.find(arg => arg.id === selectedNodeId);
      if (selectedNode) {
        setSelectedNode({
          id: selectedNode.id,
          name: selectedNode.statement,
          color: getColor(selectedNode),
          argument: selectedNode
        });
      }
    } else {
      setSelectedNode(null);
    }
  }, [graph, selectedNodeId]);

  const handleAddArgument = (statement: string) => {
    if (socket && user) {
      socket.emit('add argument', { graphId, statement });
    }
  };

  const handlePrevNode = () => {
    if (!graphData.nodes.length) return;
    const newIndex = selectedNodeIndex > 0
      ? selectedNodeIndex - 1
      : graphData.nodes.length - 1;
    setSelectedNodeIndex(newIndex);
    setSelectedNodeId(graphData.nodes[newIndex].id);
  };

  const handleNextNode = () => {
    if (!graphData.nodes.length) return;
    const newIndex = (selectedNodeIndex + 1) % graphData.nodes.length;
    setSelectedNodeIndex(newIndex);
    setSelectedNodeId(graphData.nodes[newIndex].id);
  };

  const handleNodeClick = (node: any) => {
    const index = graphData.nodes.findIndex(n => n.id === node.id);
    setSelectedNodeIndex(index);
    setSelectedNodeId(node.id);
  };

  const nodeCanvasObject = React.useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const radius = 5;  // Base radius size in pixels
    const color = node.color || '#94a3b8';

    // Draw the circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    // If this is the selected node, draw a border
    if (node.id === selectedNodeId) {
      ctx.strokeStyle = color + '60'; // Lower opacity for border
      ctx.lineWidth = 8 / globalScale;
      ctx.stroke();
    }
  }, [selectedNodeId]);

  if (!graph) {
    return <div className="flex items-center justify-center h-full mt-8">
      <LoadingSpinner size="large" />
    </div>;
  }

  return (
    <div className="w-full h-[calc(100vh-8rem)] relative">
      <div className="absolute top-4 left-4 z-10 bg-white/80 px-2 py-1 rounded-lg shadow-sm flex items-center gap-2">
        <Link to="/graphs" className={`${buttonStyles.secondary} !p-1 min-w-8 flex items-center justify-center`}>
          ←
        </Link>
        <p className="text-base m-0">
          {graph.name}
          {graph.arguments.length === 0 && <p className="inline text-sm text-slate-400"> (empty)</p>}
        </p>
      </div>
      <ForceGraph2D
        width={window.innerWidth}
        height={window.innerHeight - 124}
        graphData={graphData}
        nodeLabel="name"
        onNodeClick={handleNodeClick}
        enableNodeDrag={true}
        nodeCanvasObject={nodeCanvasObject}
        nodeCanvasObjectMode={() => 'replace'}
      />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-[600px] flex flex-col gap-4">
        {selectedNode && (
          <NodeInfoBox
            argument={selectedNode.argument}
            onClose={() => {
              setSelectedNodeId(null);
              setSelectedNodeIndex(0);
            }}
            onPrevNode={handlePrevNode}
            onNextNode={handleNextNode}
            totalNodes={graphData.nodes.length}
            currentIndex={selectedNodeIndex + 1}
          />
        )}
        {user ? (
          <form
            className=" flex gap-2 w-full"
            onSubmit={(e) => {
              e.preventDefault();
              if (newArgument.trim()) {
                handleAddArgument(newArgument.trim());
                setNewArgument('');
              }
            }}
          >
            <input
              type="text"
              placeholder="Enter new argument"
              className="flex-1 shadow-md"
              onChange={(e) => setNewArgument(e.target.value)}
              value={newArgument}
            />
            <button
              type="submit"
              className={`${buttonStyles.primary} shadow-md`}
            >
              Add
            </button>
          </form>
        ) : (
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p className="text-sm text-slate-400">Sign in to add arguments</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphView;