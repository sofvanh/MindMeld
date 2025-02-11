import { useEffect } from 'react';

const DEFAULT_TITLE = 'Nexus';

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} - ${DEFAULT_TITLE}` : DEFAULT_TITLE;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title]);
}
