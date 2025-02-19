import React from 'react';
import { usePageTitle } from '../../hooks/usePageTitle';
import DocsDocNavigation from './DocsDocNavigation';
import { Link } from 'react-router-dom';
import DocsLayout from './DocsLayout';

const GettingStartedView: React.FC = () => {
  usePageTitle('Getting Started - Nexus Docs');

  // TODO: Add the scores explanation here too
  // TODO: Make the links to the other pages scroll to the top of the page
  return (
    <DocsLayout>
      <div className="relative px-4 max-w-screen-md mx-auto my-16">
        <h1 id="getting-started">Getting Started</h1>
        <div className="prose prose-stone max-w-none">
          <p>Welcome to Nexus! This guide will tell you everything you need to know about <a href="#core-features">how to use the tool</a>, <Link to="/docs/technical-details">how the tool works</Link> under the hood, and <Link to="/docs/philosophy">why it works the way that it does</Link>.</p>

          <h2 id="core-features">Core Features</h2>
          <p>There are two main things you can do:</p>
          <ol>
            <li>Write statements</li>
            <li>React to statements</li>
          </ol>
          <p>All statements and reactions are recorded and organized into a 2d graph, showing the state of the discussion so far.</p>

          <h3 id="statements">Statements</h3>
          <p>In the graph tab, you can write new statements. These are statements of opinion, related to the topic, that you think will advance the discussion forward.</p>
          <p>Write opinions which you feel are not currently well represented by existing statements, and ideally offer a unique and nuanced perspective.</p>

          <h3 id="reactions">Reactions</h3>
          <p>In the feed tab, you can react to statements in three different ways:</p>
          <ul className="styled-list">
            <li><strong>Agree/Disagree:</strong> For when you have an opinion about the statement.</li>
            <li><strong>Low-quality:</strong> For statements that you think are confusing, poorly written, toxic, off-topic, or otherwise low-quality.</li>
          </ul>
          <p>If you have no opinion, feel free to skip the statement.</p>

          <h3 id="graph">Graph View</h3>
          <p>All submitted statements are represented as nodes in a graph, visible in the graph view. Each statement also receives a semantic embedding from a language model, and <b>semantically similar statements are connected together</b>, forming the edges of the graph.</p>

          <p>Nodes in the graph are also given a color, which is determined by the following scores summarizing how users reacted:</p>

          <h4>Consensus</h4>
          <p>Measures how often users, who normally disagree with each other, converge to the same opinion.</p>
          <p>This is shown as a shade of green.</p>

          <h4>Divergence</h4>
          <p>Measures how often users, who normally agree with each other, diverge to different opinions.</p>
          <p>This is shown as a shade of orange.</p>

          <h4>Quality</h4>
          <p>Measures how often users flagged a statement as "low-quality".</p>
          <p>This is shown by opacity (low-quality statements are increasingly transparent).</p>
        </div>
      </div>
    </DocsLayout>
  );
};

export default GettingStartedView;
