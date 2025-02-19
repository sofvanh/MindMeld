import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface NavLink {
  title: string;
  href: string;
}

interface NavSection {
  header: string;
  href: string;
  links: NavLink[];
}

interface DocNavigationProps {
  sections: NavSection[];
  children: React.ReactNode;
}

const DocNavigation: React.FC<DocNavigationProps> = ({ sections, children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();

    // Split the href into path and hash
    const [path, hash] = href.split('#');
    const currentPath = location.pathname;

    if (path === currentPath) {
      // If we're on the same page, just scroll to the anchor
      const element = document.querySelector(`#${hash}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState({}, '', href);
      }
    } else {
      // If we're navigating to a new page, use navigate and then scroll
      navigate(href);
      // After navigation, wait for next tick to scroll to anchor
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

  const isCurrentPage = (href: string) => {
    const [path] = href.split('#');
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile navigation - appears at top */}
      <div className="md:hidden">
        <nav className="w-full border-b border-stone-200 bg-white mb-8">
          <div className="px-4 py-4">
            {sections.map((section) => (
              <div key={section.header} className="mb-4 last:mb-0">
                <a
                  href={section.href}
                  onClick={(e) => handleClick(e, section.href)}
                  className="block"
                >
                  <h3 className={`text-sm mb-2 ${isCurrentPage(section.href)
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
                        onClick={(e) => handleClick(e, link.href)}
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

      {/* Desktop navigation - fixed on left side */}
      <div className="hidden md:flex flex-row">
        <div className="w-64 border-r border-stone-200 bg-white">
          <nav className="sticky top-16 w-64 overflow-y-auto">
            <div className="px-6 py-8">
              {sections.map((section) => (
                <div key={section.header} className="mb-8 last:mb-0">
                  <a
                    href={section.href}
                    onClick={(e) => handleClick(e, section.href)}
                    className="block"
                  >
                    <h4 className="text-sm font-semibold text-stone-500 mb-3 hover:text-stone-700">{section.header}</h4>
                  </a>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          onClick={(e) => handleClick(e, link.href)}
                          className={`text-sm block py-1 ${isCurrentPage(link.href)
                            ? 'text-emerald-600 font-medium'
                            : 'text-stone-700 hover:text-stone-900'
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
    </>
  );
};

export default DocNavigation;
