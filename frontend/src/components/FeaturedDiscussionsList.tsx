import { useState, useEffect } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { GraphData } from '../shared/types';
import { GraphsList } from './GraphsList';


export const FeaturedDiscussionsList = () => {
  const { socket } = useWebSocket();
  const [graphs, setGraphs] = useState<GraphData[]>([]);

  useEffect(() => {
    socket?.emit('get featured graphs', {}, (response: any) => {
      if (response.success) {
        const sortedGraphs = [...response.data.graphs].sort((a, b) => {
          if (a.name === "Nexus Feedback") return 1;
          if (b.name === "Nexus Feedback") return -1;
          return 0;
        });
        setGraphs(sortedGraphs);
      }
    });
  }, [socket]);

  return (
    <div className="flex flex-col mx-auto my-4">
      <h2>Featured discussions</h2>
      <small className="block mb-8">
        Selected discussions for exploring Nexus. Contribute to the conversation and help us improve by leaving your feedback.
      </small>
      <GraphsList graphs={graphs} />
    </div>
  );
};
