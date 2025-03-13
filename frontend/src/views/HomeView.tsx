import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWebSocket } from '../contexts/WebSocketContext';
import { buttonStyles } from '../styles/defaultStyles';
import { useAuth } from '../contexts/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { FeaturedDiscussionsList } from '../components/FeaturedDiscussionsList';
import { MyDiscussionsList } from '../components/MyDiscussionsList';
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
        <FeaturedDiscussionsList />
      </div>
      {user ? (
        <>
          <div className="my-24 bg-stone-100 p-6">
            <h2 className="mb-2">Create new discussion</h2>
            <small className="block mb-8">Discussions you create will appear under "My discussions" below. Anyone with a link to the discussion will be able to view and contribute to it.</small>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleCreateGraph} className="mb-4">
              <div className="flex flex-row">

                <input
                  type="text"
                  value={graphName}
                  onChange={(e) => setGraphName(e.target.value)}
                  placeholder="Topic of discussion"
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
            <MyDiscussionsList />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center text-center mt-14 mb-20 bg-stone-100 p-6">
          <h4>
            Sign in to start your own discussion, contribute to existing ones, and more!
          </h4>
          <SignInOutButton />
        </div>
      )}
    </div >
  );
};

export default HomeView;
