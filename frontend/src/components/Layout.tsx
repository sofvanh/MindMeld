import React from 'react';
import { Link } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-stone-600 text-white p-4">
        <Link to="/" className="text-2xl font-serif hover:text-stone-300">MindMeld</Link>
      </header>
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-gray-200 p-4 text-center">
        <p className="text-sm">© 2024 Nicholas Kees Dupuis and Sofia Vanhanen. Licensed under the GNU GPLv3.</p>
      </footer>
    </div>
  );
};

export default Layout;