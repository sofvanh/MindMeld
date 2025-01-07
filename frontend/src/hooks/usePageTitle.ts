import { useEffect } from 'react';

const DEFAULT_TITLE = 'MindMeld';

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} - ${DEFAULT_TITLE}` : DEFAULT_TITLE;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title]);
}