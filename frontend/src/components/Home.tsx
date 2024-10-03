import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-serif mb-4 mt-8">Welcome to MindMeld</h1>
      <p className="mb-4">Select a graph or create a new one to get started.</p>
      <Link to="/graph/new" className="bg-stone-500 hover:bg-stone-700 text-white font-serif font-thin py-2 px-4 rounded">
        Create New Graph
      </Link>
    </div>
  );
};

export default Home;