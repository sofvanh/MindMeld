import { useState, useEffect } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { Graph } from '../shared/types';
import { GraphInfoBox } from './GraphInfoBox';
import LoadingSpinner from './LoadingSpinner';



const FEATURED_GRAPH_IDS = [
  "gra_m47bz12vUA7fMZ",
  "gra_m4aadsqmZDs8oI",
  "gra_m4abp2spuJ9yW5"
]

export const FeaturedGraphsList = () => {
  const { socket } = useWebSocket();
  const [graphs, setGraphs] = useState<Graph[]>([]);

  useEffect(() => {
    socket?.emit('get graphs', {}, (response: any) => {
      if (response.success) {
        const graphsList = response.data.graphs;
        const featuredGraphs = graphsList.filter((g: any) => FEATURED_GRAPH_IDS.includes(g.id));
        setGraphs(featuredGraphs.map((g: any) => ({ id: g.id, name: g.name, arguments: [], edges: [] })));
      }
    });
  }, [socket]);

  return (
    <div className="flex flex-col mx-auto mt-4">
      <h2>Featured graphs</h2>
      {graphs.length > 0 ? (
        <div className="border-b border-stone-200 mb-8">
          {graphs.map(graph => (
            <GraphInfoBox key={graph.id} {...graph} />
          ))}
        </div>
      ) : (
        <LoadingSpinner className="mt-4" />
      )
      }
    </div>
  );
};
