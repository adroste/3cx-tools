import { useEffect, useRef } from 'react';

import { ActiveCallRow } from './ActiveCallRow';
import { CallLogRow } from './CallLogRow';
import { useActiveCalls } from './useActiveCalls';
import { useCallLogs } from './useCallLogs';
import { useTranslation } from 'react-i18next';

export function CallOverview() {
  const { t } = useTranslation();
  const callLogs = useCallLogs(1000);
  const activeCalls = useActiveCalls();
  const activeCallIdsRef = useRef<number[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeIds = activeCalls.map(({ id }) => id);
    // refresh call logs everytime active-calls change (by comparing the ids)
    if (
      activeIds.length !== activeCallIdsRef.current.length
      || !activeIds.every((id) => activeCallIdsRef.current.includes(id))
    ) {
      activeCallIdsRef.current = activeIds;

      // scroll back to top, so the user can't miss out on new calls
      wrapperRef.current?.scrollTo(0,0);
    }
  }, [activeCalls]);

  return (
    <div className="overflow-y-scroll overflow-x-auto h-full max-h-full" ref={wrapperRef}>

      <div className="w-full min-w-full">

        <header className="w-full bg-gray-50 sticky top-0 z-10 py-3 px-4 grid grid-cols-[60px_1fr_2fr_88px] gap-10">
          <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {t('Type')}
          </div>
          <div className="md:hidden col-span-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {t('Date')} / {t('Call details')}
          </div>
          <div className="hidden md:block text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {t('Date')}
          </div>
          <div className="hidden md:block text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {t('Call details')}
          </div>
          <div></div>
        </header>

        <main className="bg-white divide-y divide-gray-200">
          {activeCalls.map(activeCall => (
            <ActiveCallRow
              key={activeCall.id}
              activeCall={activeCall}
            />
          ))}
          {callLogs.map(callLog => (
            <CallLogRow
              key={callLog.id}
              callLog={callLog}
            />
          ))}
        </main>
      </div>
    </div>
  );
}