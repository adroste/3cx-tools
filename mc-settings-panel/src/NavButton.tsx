import { useCallback, useMemo } from 'react';

import { SparklesIcon } from '@heroicons/react/solid';
import { removeSearchParamsFromUrl } from './integrateUtils';
import { useRouter } from './useRouter';

export function NavButton() {
  const [hash, goTo] = useRouter();

  const isActive = useMemo(() => {
    return hash.includes('tcx-tools-settings-active');
  }, [hash]);

  const onClick = useCallback(() => {
    if (isActive)
      goTo(removeSearchParamsFromUrl(hash));
    else
      goTo(removeSearchParamsFromUrl(hash) + '?tcx-tools-settings-active');
  }, [goTo, hash, isActive]);

  return (
    <div 
      className={`flex items-center px-4 py-3 w-full text-sm text-gray-500 text-center hover:bg-sky-700 hover:text-gray-100 hover:cursor-pointer ${isActive && 'bg-sky-900 text-gray-100'}`}
      onClick={onClick}
    >
      <SparklesIcon className="h-4 w-4 mr-4" />
      <span>3CX Tools</span>
    </div>
  );
}