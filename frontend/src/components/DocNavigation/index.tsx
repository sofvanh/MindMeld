import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NavSection } from './types';
import MobileDocNavigation from './MobileDocNavigation';
import DesktopDocNavigation from './DesktopDocNavigation';

interface DocNavigationProps {
  sections: NavSection[];
  children: React.ReactNode;
}

// TODO This is now duplicate code, we also do this kind of thing with the graph view legend
const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(window.matchMedia('(max-width: 767px)').matches);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isMobile;
};

const DocNavigation: React.FC<DocNavigationProps> = ({ sections, children }) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();

    const [path, hash] = href.split('#');
    const currentPath = location.pathname;

    if (path === currentPath) {
      const element = document.querySelector(`#${hash}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState({}, '', href);
      }
    } else {
      navigate(href);
      if (hash) {
        setTimeout(() => {
          const element = document.querySelector(`#${hash}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 0);
      }
    }
  };

  return (
    <>
      {isMobile ? (
        <MobileDocNavigation
          sections={sections}
          onNavigate={handleNavigate}
        >
          {children}
        </MobileDocNavigation>
      ) : (
        <DesktopDocNavigation
          sections={sections}
          onNavigate={handleNavigate}
        >
          {children}
        </DesktopDocNavigation>
      )}
    </>
  );
};

export default DocNavigation;
