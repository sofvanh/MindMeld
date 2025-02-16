import { useState, useEffect } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { GraphData } from '../shared/types';
import { GraphsList } from './GraphsList';


export const FeaturedGraphsList = () => {
  const { socket } = useWebSocket();
  const [graphs, setGraphs] = useState<GraphData[]>([]);

  useEffect(() => {
    socket?.emit('get featured graphs', {}, (response: any) => {
      if (response.success) {
        setGraphs(response.data.graphs);
      }
    });
  }, [socket]);

  return (
    <div className="flex flex-col mx-auto my-4">
      <h2>Featured graphs</h2>
      <small className="block mb-8">
        Selected graphs from the Nexus community
      </small>
      <GraphsList graphs={graphs} />
    </div>
  );
};
