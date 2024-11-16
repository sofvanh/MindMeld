import React from 'react';
import Header from './Header';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200 px-4 text-center h-16 flex items-center justify-center">
        <p className="text-sm text-slate-600">© 2024 Nicholas Kees Dupuis and Sofia Vanhanen. Licensed under the GNU GPLv3.</p>
      </footer>
    </div>
  );
};

export default Layout;