import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-stone-600 text-white p-4">
        <h1 className="text-2xl font-serif">MindMeld</h1>
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