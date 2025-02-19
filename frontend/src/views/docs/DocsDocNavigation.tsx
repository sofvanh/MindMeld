import React from 'react';
import DocNavigation from '../../components/DocNavigation';

const navigationSections = [
  {
    header: 'Getting Started',
    href: '/docs/getting-started#getting-started',
    links: [
      { title: 'Core Features', href: '/docs/getting-started#core-features' },
      { title: 'Statements', href: '/docs/getting-started#statements' },
      { title: 'Reactions', href: '/docs/getting-started#reactions' },
      { title: 'Graph View', href: '/docs/getting-started#graph' },
    ]
  },
  {
    header: 'Technical Details',
    href: '/docs/technical-details#technical-details',
    links: [
      { title: 'Graph Structure', href: '/docs/technical-details#graph-structure' },
      { title: 'Statement Scores', href: '/docs/technical-details#statement-scores' },
    ]
  },
  {
    header: 'Philosophy',
    href: '/docs/philosophy#philosophy',
    links: [
      { title: 'Core Design Principles', href: '/docs/philosophy#core-design-principles' },
      { title: 'Strategies', href: '/docs/philosophy#strategies' },
      { title: 'Big Picture Goals', href: '/docs/philosophy#big-picture-goals' },
    ]
  }
];

interface DocsDocNavigationProps {
  children: React.ReactNode;
}

const DocsDocNavigation: React.FC<DocsDocNavigationProps> = ({ children }) => {
  return <DocNavigation sections={navigationSections}>{children}</DocNavigation>;
};

export default DocsDocNavigation;
