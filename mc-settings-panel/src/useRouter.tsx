import { useEffect, useState } from 'react';

import { goTo } from './history';

export function useRouter()  {
  const [hash, setHash] = useState<string>(window.location.hash || '#');

  useEffect(() => {
    const handler = () => {
      setHash(window.location.hash || '#');
    };
    window.addEventListener('locationchange', handler);
    return () => window.removeEventListener('locationchange', handler);
  }, []);

  return [hash, goTo] as const;
}