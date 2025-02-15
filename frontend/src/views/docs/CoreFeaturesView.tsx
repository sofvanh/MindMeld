import React from 'react';
import { usePageTitle } from '../../hooks/usePageTitle';
import DocsDocNavigation from './DocsDocNavigation';

const CoreFeaturesView: React.FC = () => {
  usePageTitle('Core Features - Nexus Docs');

  return (
    <div className="relative">
      <DocsDocNavigation />

      {/* Main content - adjusted with left margin on desktop */}
      <div className="md:ml-64">
        <div className="px-4 max-w-screen-md mx-auto my-16">
          <h1 id="core-features">Core Features</h1>
          <div className="prose prose-stone max-w-none">
            <h2 id="statements">Statements</h2>
            <p>In the graph tab, you can write new statements. These are statements of opinion, related to the topic, that you think will advance the discussion forward.</p>
            <p>Write opinions which you feel are not currently well represented by existing statements, and ideally offer a unique and nuanced perspective.</p>

            <h2 id="reactions">Reactions</h2>
            <p>In the feed tab, you can react to statements in three different ways:</p>
            <ul>
              <li><strong>Agree/Disagree:</strong> For when you have an opinion about the statement.</li>
              <li><strong>Low-quality:</strong> For statements that you think are confusing, poorly written, toxic, off-topic, or otherwise low-quality.</li>
            </ul>
            <p>If you have no opinion, feel free to skip the statement.</p>

            <h2 id="graph">Graph</h2>
            <p>All submitted statements are represented as nodes in a graph, visible in the graph view. Each statement also receives a semantic embedding from a language model, and semantically similar statements are connected together, forming the edges of the graph.</p>

            <p>Nodes in the graph are also given a color, which is determined by the following scores summarizing how users reacted:</p>

            <h3>Consensus</h3>
            <p>Measures how often users, who normally disagree with each other, converge to the same opinion.</p>
            <p>This is shown as a shade of green.</p>

            <h3>Divergence</h3>
            <p>Measures how often users, who normally agree with each other, diverge to different opinions.</p>
            <p>This is shown as a shade of orange.</p>

            <h3>Quality</h3>
            <p>Measures how often users flagged a statement as "low-quality".</p>
            <p>This is shown by opacity (low-quality statements are increasingly transparent).</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoreFeaturesView;
