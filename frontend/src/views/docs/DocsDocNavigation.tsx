import React from 'react';
import DocNavigation from '../../components/DocNavigation';

const navigationSections = [
  {
    header: 'Getting Started',
    href: '/docs/getting-started#getting-started',
    links: [
      { title: 'Welcome', href: '/docs/getting-started#welcome' },
      { title: 'How to Use It', href: '/docs/getting-started#how-to-use-it' },
    ]
  },
  {
    header: 'Core Features',
    href: '/docs/core-features#core-features',
    links: [
      { title: 'Statements', href: '/docs/core-features#statements' },
      { title: 'Reactions', href: '/docs/core-features#reactions' },
      { title: 'Graph', href: '/docs/core-features#graph' },
    ]
  },
  {
    header: 'Technical Details',
    href: '/docs/technical-details#technical-details',
    links: [
      { title: 'How It Works', href: '/docs/technical-details#how-it-works' },
      { title: 'Graph Structure', href: '/docs/technical-details#graph-structure' },
      { title: 'Statement Scores', href: '/docs/technical-details#statement-scores' },
    ]
  },
  {
    header: 'Philosophy',
    href: '/docs/philosophy#philosophy',
    links: [
      { title: 'Why It Works This Way', href: '/docs/philosophy#why-it-works-this-way' },
      { title: 'Strategies', href: '/docs/philosophy#strategies' },
      { title: 'Big Picture Goals', href: '/docs/philosophy#big-picture-goals' },
    ]
  }
];

const DocsDocNavigation: React.FC = () => {
  return <DocNavigation sections={navigationSections} />;
};

export default DocsDocNavigation;
