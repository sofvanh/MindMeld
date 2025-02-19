import React from 'react';
import { useLocation } from 'react-router-dom';
import { NavSection } from './types';

interface DesktopDocNavigationProps {
  sections: NavSection[];
  children: React.ReactNode;
  onNavigate: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}

const DesktopDocNavigation: React.FC<DesktopDocNavigationProps> = ({
  sections,
  children,
  onNavigate,
}) => {
  const location = useLocation();

  const isCurrentPage = (href: string) => {
    const [path] = href.split('#');
    return location.pathname === path;
  };

  return (
    <div className="flex flex-row">
      <div className="w-64 border-r border-stone-200 bg-white">
        <nav className="sticky top-16 w-64 overflow-y-auto">
          <div className="px-6 py-8">
            {sections.map((section) => (
              <div key={section.header} className="mb-8 last:mb-0">
                <a
                  href={section.href}
                  onClick={(e) => onNavigate(e, section.href)}
                  className="block"
                >
                  <h4
                    className={`text-sm mb-3 ${isCurrentPage(section.href)
                      ? 'text-sky-600 hover:text-sky-800'
                      : 'hover:text-sky-900'
                      }`}
                  >
                    {section.header}
                  </h4>
                </a>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        onClick={(e) => onNavigate(e, link.href)}
                        className={`text-sm block py-1 ${isCurrentPage(link.href)
                          ? 'text-sky-600 font-medium hover:text-sky-800'
                          : 'text-stone-700'
                          }`}
                      >
                        {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>
      </div>
      {children}
    </div>
  );
};

export default DesktopDocNavigation;
