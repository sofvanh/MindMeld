import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWebSocket } from '../contexts/WebSocketContext';
import { buttonStyles } from '../styles/defaultStyles';
import { useAuth } from '../contexts/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { FeaturedGraphsList } from '../components/FeaturedGraphsList';
import { MyGraphsList } from '../components/MyGraphsList';
import SignInOutButton from '../components/SignInOutButton';


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
        <h1>Welcome to Nexus</h1>
        <h4 className="text-stone-500 mb-8">
          Group deliberation, empowered.
        </h4>
        <p>
          Nexus is an experimental platform for group deliberation. Our aim is to use large language models to help groups understand each other better and surface insights and solutions that wouldn't have been found otherwise.
        </p>
        <p>
          Nexus is being built by <a href="https://mosaic-labs.org" target="_blank" rel="noopener noreferrer">a small research team</a> working on applying AI to group reasoning problems.
        </p>
        <p>
          New to Nexus? Check out our <Link to="/docs/getting-started">documentation</Link> to get started.
        </p>
      </div>
      <div className="my-24">
        <FeaturedGraphsList />
      </div>
      {user ? (
        <>
          <div className="my-24 bg-stone-100 p-6">
            <h2 className="mb-2">Create new graph</h2>
            <small className="block mb-8">Graphs you create will appear under "My Graphs" below. Anyone with a link to the graph will be able to view and contribute to it.</small>
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
          <div className="my-24">
            <MyGraphsList />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center text-center mt-14 mb-20 bg-stone-100 p-6">
          <h4>
            Sign in to create your own graphs, contribute to existing graphs, and more!
          </h4>
          <SignInOutButton />
        </div>
      )}
    </div >
  );
};

export default HomeView;
