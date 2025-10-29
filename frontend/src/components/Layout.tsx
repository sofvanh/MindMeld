import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout: React.FC<{ children: React.ReactNode, hideFooter?: boolean, hideHeader?: boolean }> = ({ children, hideFooter = false, hideHeader = false }) => {
  return (
    <div className="flex flex-col min-h-dvh">
      {!hideHeader && <Header />}
      <main className="flex-grow flex flex-col">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default Layout;
