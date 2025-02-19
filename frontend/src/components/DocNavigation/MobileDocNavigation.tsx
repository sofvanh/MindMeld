import React from 'react';
import { useLocation } from 'react-router-dom';
import { NavSection } from './types';

interface MobileDocNavigationProps {
  sections: NavSection[];
  children: React.ReactNode;
  onNavigate: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}

const MobileDocNavigation: React.FC<MobileDocNavigationProps> = ({
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
    <div>
      <nav className="w-full border-b border-stone-200 bg-white mb-8">
        <div className="px-4 py-4">
          {sections.map((section) => (
            <div key={section.header} className="mb-4 last:mb-0">
              <a
                href={section.href}
                onClick={(e) => onNavigate(e, section.href)}
                className="block"
              >
                <h3
                  className={`text-sm mb-2 ${isCurrentPage(section.href)
                    ? 'text-sky-600 hover:text-sky-800'
                    : 'hover:text-sky-900'
                    }`}
                >
                  {section.header}
                </h3>
              </a>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={(e) => onNavigate(e, link.href)}
                      className={`text-sm block ${isCurrentPage(link.href)
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
      {children}
    </div>
  );
};

export default MobileDocNavigation;
