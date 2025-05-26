import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAuth } from '../contexts/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';
import ErrorMessage from '../components/ErrorMessage';
import { GraphsList } from '../components/GraphsList';
import { GraphData } from '../shared/types';

const AdminView: React.FC = () => {
  const { socket } = useWebSocket();
  const { user, loading: authLoading } = useAuth();
  const [graphs, setGraphs] = useState<GraphData[] | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  usePageTitle('All graphs');

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    socket?.emit('get graphs', {}, (response: any) => {
      if (response.success) {
        setGraphs(response.data.graphs);
      } else {
        setError(response.error || 'Failed to get graphs');
        setGraphs([]);
      }
    });
  }, [socket, user]);

  if (authLoading) {
    return <div className="flex flex-col items-center mt-8 h-full"><div className="w-12 h-12" /></div>;
  }

  if (!user || user.role !== 'admin') {
    return <ErrorMessage title="Not authorized" message="You do not have permission to view this page." />;
  }

  return (
    <div className="w-full max-w-screen-md mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin: All Graphs</h1>
          <p className="text-stone-500">View and manage all graphs in the system.</p>
        </div>
      </div>
      <GraphsList graphs={graphs} error={error} />
    </div>
  );
};

export default AdminView;
