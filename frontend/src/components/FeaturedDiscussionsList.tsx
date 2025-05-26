import { useState, useEffect } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { GraphData } from '../shared/types';
import { GraphsList } from './GraphsList';


export const FeaturedDiscussionsList = () => {
  const { socket } = useWebSocket();
  const [graphs, setGraphs] = useState<GraphData[]>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    socket?.emit('get featured graphs', {}, (response: any) => {
      if (response.success) {
        setGraphs(response.data.graphs);
      } else {
        setError(response.error);
      }
    });
  }, [socket]);

  return (
    <div className="flex flex-col mx-auto my-4">
      <h2>Featured discussions</h2>
      <small className="block mb-8">
        Selected discussions for exploring Nexus. Contribute to the conversation and help us improve by leaving your feedback.
      </small>
      <GraphsList graphs={graphs} error={error} />
    </div>
  );
};
