import React from 'react';
import { usePageTitle } from '../../hooks/usePageTitle';
import DocsDocNavigation from './DocsDocNavigation';

const GettingStartedView: React.FC = () => {
  usePageTitle('Getting Started - Nexus Docs');

  return (
    <div className="relative">
      <DocsDocNavigation />

      {/* Main content - adjusted with left margin on desktop */}
      <div className="md:ml-64">
        <div className="px-4 max-w-screen-md mx-auto my-16">
          <h1 id="getting-started">Nexus Documentation</h1>
          <div className="prose prose-stone max-w-none">
            <h2 id="welcome">Welcome to Nexus!</h2>
            <p>This guide will tell you everything you need to know about how to use the tool, how the tool works under the hood, and why it works the way that it does.</p>

            <h2 id="how-to-use-it">How to use it</h2>
            <p>There are two main things you can do:</p>
            <ol>
              <li>Write statements</li>
              <li>React to statements</li>
            </ol>
            <p>All statements and reactions are recorded and organized into a 2d graph, showing the state of the discussion so far.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GettingStartedView;
