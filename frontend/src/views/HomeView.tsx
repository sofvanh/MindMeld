import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWebSocket } from '../contexts/WebSocketContext';
import { buttonStyles } from '../styles/defaultStyles';
import { useAuth } from '../contexts/AuthContext';
import SignInOutButton from '../components/SignInOutButton';
import { usePageTitle } from '../hooks/usePageTitle';
import { FeaturedGraphsList } from '../components/FeaturedGraphsList';


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
      socket.emit('create graph', { name: graphName }, (response: any) => {
        if (response.success) {
          navigate(`/graph/${response.data.id}`);
        } else {
          console.error('Failed to create graph:', response.error);
          setError(response.error);
        }
      });
    }
  };

  return (
    <div className="px-4 max-w-screen-md mx-auto">
      <h1 className="my-16">Welcome to MindMeld</h1>
      <FeaturedGraphsList />
      {user && (
        <>
          <div className="my-8">
            <h2>My graphs</h2>
            <p>No graphs yet.</p>
          </div>
          <div>
            <h3>Create new graph</h3>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleCreateGraph} className="mb-4">
              <div className="flex flex-row">

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
              </div>
            </form>
          </div>
        </>
      )
      }
    </div >
  );
};

export default HomeView;