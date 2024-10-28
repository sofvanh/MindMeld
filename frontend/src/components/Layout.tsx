import React from 'react';
import { Link } from 'react-router-dom';
import SignInOutButton from './SignInOutButton';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // TODO Needs a visual update
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-stone-100 px-4 flex justify-between items-center h-16">
        <Link to="/" className="text-2xl font-serif text-stone-900 hover:text-stone-600">MindMeld</Link>
        <SignInOutButton />
      </header>
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-stone-100 px-4 text-center h-16 flex items-center justify-center">
        <p className="text-sm">© 2024 Nicholas Kees Dupuis and Sofia Vanhanen. Licensed under the GNU GPLv3.</p>
      </footer>
    </div>
  );
};

export default Layout;