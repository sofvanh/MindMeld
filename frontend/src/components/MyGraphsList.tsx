import { useState, useEffect } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { GraphData } from '../shared/types';
import { GraphsList } from './GraphsList';


export const MyGraphsList = () => {
  const { socket } = useWebSocket();
  const [graphs, setGraphs] = useState<GraphData[]>([]);

  useEffect(() => {
    socket?.emit('get my graphs', {}, (response: any) => {
      if (response.success) {
        setGraphs(response.data.graphs);
      }
    });
  }, [socket]);

  return (
    <div className="flex flex-col mx-auto mt-4">
      <h2>My graphs</h2>
      <small className="block mb-8">
        Graphs you've created or contributed to
      </small>
      <GraphsList graphs={graphs} />
    </div>
  );
};
