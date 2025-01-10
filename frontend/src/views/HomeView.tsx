import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../contexts/WebSocketContext';
import { buttonStyles } from '../styles/defaultStyles';
import { useAuth } from '../contexts/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { FeaturedGraphsList } from '../components/FeaturedGraphsList';
import { MyGraphsList } from '../components/MyGraphsList';


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
      <div className="my-16">
        <h1>Welcome to MindMeld</h1>
        <p className="text-lg text-stone-500 mb-8 font-semibold">
          Group deliberation, empowered.
        </p>
        <p>
          MindMeld is an experimental platform for group deliberation. Our aim is to use large language models to help groups understand each other better and surface insights and solutions that wouldn't have been found otherwise.
        </p>
        <p>
          MindMeld is being built by <a href="https://mosaic-labs.org" target="_blank" rel="noopener noreferrer">a small research team</a> with a strong background in generative AI, group dynamics, software engineering, and AI safety.
        </p>
      </div>
      <FeaturedGraphsList />
      {user ? (
        <>
          <div className="my-8">
            <MyGraphsList />
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
      ) : (
        <p>Sign in to create your own graphs, contribute to existing graphs, and more!</p>
      )}
    </div >
  );
};

export default HomeView;