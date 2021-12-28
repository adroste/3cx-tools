import { useEffect, useState } from 'react';

import { ActiveCall } from './wsApiTypes';
import { Caller } from './Caller';
import { ClockIcon } from '@heroicons/react/outline';
import { PhoneIcon } from '@heroicons/react/solid';
import dayjs from 'dayjs';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';

export function translateActiveCallStatus(status: string) {
  switch (status) {
    case 'Routing':
      return t('Connecting');
    case 'Transferring':
      return t('Transferring');
    case 'Talking':
      return t('Connected');
    default:
      return status;
  }
}

export function ActiveCallRow({ activeCall }: { activeCall: ActiveCall }) {
  const { establishedAt, status } = activeCall;
  const { t } = useTranslation();
  const [duration, setDuration] = useState('00:00:00');

  useEffect(() => {
    const start = dayjs(establishedAt);
    const update = () => {
      const diff = dayjs.duration(dayjs().diff(start));
      setDuration(diff.format('HH:mm:ss'));
    };
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [establishedAt]);

  return (
    <div className="bg-lime-200 py-3 px-4 grid grid-cols-[60px_1fr_2fr_88px] gap-10 gap-y-1 items-center">
      <div className="flex items-center flex-col whitespace-nowrap row-span-2 md:row-span-1">
        <div className="flex-shrink-0 h-7 w-7">
          <PhoneIcon className="-scale-x-100 text-blue-500" />
        </div>
        <span className="text-xs text-gray-500">
          {translateActiveCallStatus(status)}
        </span>
      </div>

      <div className="flex items-center col-span-3 md:col-span-1">
        <div className="ml-0 flex items-center md:block">
          <div className="text-sm font-medium text-gray-900 whitespace-pre-wrap">
            {t('{{val, datetime}}', {
              val: new Date(establishedAt), formatParams: {
                val: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }
              }
            })}
          </div>
          <div className="text-xs font-medium text-gray-500 whitespace-pre-wrap ml-2 md:ml-0 md:mt-1">
            <span className="px-2 inline-flex items-center leading-5 rounded-full bg-blue-100 text-green-800">
              <ClockIcon className="h-3.5 w-3.5 mr-1" />
              {duration}
            </span>
          </div>
        </div>
      </div>

      <div className="row-start-2 col-span-3 col-start-2 md:row-start-1 md:col-span-2 md:col-start-3">
        <div className="text-gray-500 font-semibold text-[10px] leading-none">
          {t('Caller')}
        </div>
        <div className="text-gray-900 leading-5">
          <Caller callerInfo={activeCall.from} />
        </div>
        <div className="text-gray-500 font-semibold text-[10px] leading-none mt-1">
          {t('Callee')} 
        </div>
        <div className="text-gray-900 leading-5">
          <Caller callerInfo={activeCall.to} />
        </div>
      </div>
    </div>
  );
}