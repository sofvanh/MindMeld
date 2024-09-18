import React from 'react';
import Layout from './components/Layout';
import Chat from './components/Chat';

function App() {
  return (
    <Layout>
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Welcome to MindMeld!</h2>
        <p>Work in progress :)</p>
        <Chat />
      </div>
    </Layout>
  );
}

export default App;