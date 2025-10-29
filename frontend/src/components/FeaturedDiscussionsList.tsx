import { useState, useEffect } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { GraphData } from '../shared/types';
import { GraphsList } from './GraphsList';
import { CSV_DISCUSSIONS } from '../services/csvAdapter';


export const FeaturedDiscussionsList = () => {
  const { socket } = useWebSocket();

  // Initialize with CSV discussions immediately
  const csvGraphs: GraphData[] = CSV_DISCUSSIONS.map(csv => ({
    id: csv.id,
    name: csv.name,
    argumentCount: csv.statementCount,
    reactionCount: csv.participantCount * 5, // Estimate
    lastActivity: Date.now(),
    isPrivate: false
  }));

  const [graphs, setGraphs] = useState<GraphData[]>(csvGraphs);
  const [error, setError] = useState<string>();

  useEffect(() => {
    console.log('FeaturedDiscussionsList useEffect triggered', { socket });

    if (socket) {
      console.log('WebSocket available, trying to get regular graphs');
      // Try to get regular graphs if WebSocket is available
      socket.emit('get featured graphs', {}, (response: any) => {
        if (response.success) {
          const regularGraphs = response.data.graphs || [];
          console.log('Regular graphs loaded:', regularGraphs);
          setGraphs([...csvGraphs, ...regularGraphs]);
        } else {
          console.warn('Failed to load regular graphs:', response.error);
          // Keep CSV graphs only if regular graphs fail (already initialized)
          console.log('Keeping CSV graphs only due to failure');
        }
      });
    } else {
      // No WebSocket connection - CSV discussions are already showing from initial state
      console.log('No WebSocket connection, CSV discussions already showing');
    }
  }, [socket]);

  console.log('FeaturedDiscussionsList render', { graphs, error });

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
