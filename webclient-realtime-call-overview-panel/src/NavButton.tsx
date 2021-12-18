import { useCallback, useMemo } from 'react';

import { TableIcon } from '@heroicons/react/solid';
import { removeSearchParamsFromUrl } from './integrateUtils';
import { useRouter } from './useRouter';
import { useTranslation } from 'react-i18next';

export function NavButton() {
  const { t } = useTranslation();
  const [hash, goTo] = useRouter();

  const isActive = useMemo(() => {
    return hash.includes('tcx-tools-overview-active');
  }, [hash]);

  const onClick = useCallback(() => {
    if (isActive)
      goTo(removeSearchParamsFromUrl(hash));
    else
      goTo(removeSearchParamsFromUrl(hash) + '?tcx-tools-overview-active');
  }, [goTo, hash, isActive]);

  return (
    <div 
      className={`flex flex-col items-center w-[51px] text-[10px] text-gray-300 text-center py-2 hover:bg-sky-700 hover:text-gray-100 hover:cursor-pointer ${isActive && 'bg-sky-900'}`}
      onClick={onClick}
    >
      <TableIcon className="h-6 w-6" />
      <span>{t('Call Overview Panel')}</span>
    </div>
  );
}