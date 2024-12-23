import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWebSocket } from '../contexts/WebSocketContext';
import { buttonStyles } from '../styles/defaultStyles';
import { useAuth } from '../contexts/AuthContext';
import SignInOutButton from '../components/SignInOutButton';
import { usePageTitle } from '../hooks/usePageTitle';


const HomeView: React.FC = () => {
  const { socket } = useWebSocket();
  const { user } = useAuth();
  const [graphName, setGraphName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  usePageTitle();

  const handleCreateGraph = (e: React.FormEvent) => {
    e.preventDefault();
    if (graphName.trim() && socket) {
      console.log('Sending create graph event');
      socket.emit('create graph', graphName);
      setGraphName('');
    }
  };

  React.useEffect(() => {
    socket?.on('graph created', ({ id }) => navigate(`/graph/${id}`));
    socket?.on('graph creation error', ({ message }) => setError(message));

    return () => {
      socket?.off('graph created');
      socket?.off('graph creation error');
    };
  }, [socket, navigate]);

  return (
    <div className="text-center px-4">
      <h1 className="mb-4 mt-8">Welcome to MindMeld</h1>
      {user ? (
        <div>
          <p className="mb-4">Create a new graph to get started.</p>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleCreateGraph} className="mb-4">
            <input
              type="text"
              value={graphName}
              onChange={(e) => setGraphName(e.target.value)}
              placeholder="Enter graph name"
              className="mr-2"
            />
            <button
              type="submit"
              className={buttonStyles.primary}
            >
              Create
            </button>
          </form>
        </div>
      ) : (
        <div className="flex justify-center mb-4">
          <SignInOutButton />
        </div>
      )}
      <p className="mb-2 text-stone-400">or</p>
      <button>
        <Link to="/graphs" className={buttonStyles.secondary}>
          View Existing Graphs
        </Link>
      </button>
    </div>
  );
};

export default HomeView;