import React, { useCallback, useState } from 'react';
import { ForceGraph2D } from 'react-force-graph';

interface Node {
  id: string;
  name: string;
  val: number;
}

interface Link {
  source: string;
  target: string;
  strength?: number;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

const ArgumentMap: React.FC = () => {
  const [newArgument, setNewArgument] = useState('');
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [
      { id: '1', name: 'Rain is useful', val: 1 },
      { id: '2', name: 'Rain is reduces quality of life', val: 1 },
      { id: '3', name: 'Wildfires are not good for the world', val: 1 },
    ],
    links: [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
    ],
  });

  const handleNodeClick = useCallback((node: Node) => {
    // Here you can implement logic for when a node is clicked
    console.log('Clicked node:', node);
  }, []);

  const handleAddArgument = (text: string) => {
    const newNode: Node = {
      id: String(graphData.nodes.length + 1),
      name: text,
      val: 1,
    };
    setGraphData(prevData => ({
      nodes: [...prevData.nodes, newNode],
      links: prevData.links,
    }));
  };

  return (
    <div className="w-full h-[600px] flex flex-row">
      <div className="w-[400px] h-full bg-gray-100 p-4">
        <form onSubmit={(e) => {
          e.preventDefault();
          if (newArgument.trim()) {
            handleAddArgument(newArgument);
            setNewArgument('');
          }
        }}>
          <input
            type="text"
            placeholder="Enter argument..."
            className="w-full px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500"
            onChange={(e) => setNewArgument(e.target.value)}
            value={newArgument}
          />
          <button
            type="submit"
            className="mt-2 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Argument
          </button>
        </form>
      </div>
      <ForceGraph2D
        width={window.innerWidth - 400}
        height={600}
        graphData={graphData}
        nodeLabel="name"
        nodeAutoColorBy="id"
        onNodeClick={handleNodeClick}
        // d3Force={('link', d3.forceLink().id((d: any) => d.id).strength((d: any) => d.strength))}
        enableNodeDrag={false}
      />
    </div>
  );
};

export default ArgumentMap;