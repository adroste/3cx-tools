import { ArrowSmRightIcon, IdentificationIcon, PhoneIcon, PhoneIncomingIcon, PhoneOutgoingIcon, PlusIcon, XIcon } from '@heroicons/react/solid';
import React, { MouseEventHandler, ReactNode, useMemo } from 'react';
import { addContact, editContact, makeCall } from './integrateUtils';

import { CallLog } from './wsApiTypes';
import { Caller } from './Caller';
import { ClockIcon } from '@heroicons/react/outline';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

export function CallLogRow({ callLog }: { callLog: CallLog }) {
  const { answered, direction, extCaller, segments, startTime, talkingDuration } = callLog;
  const { t } = useTranslation();

  //.add(0,'s') is a workaround to dayjs bug when parsing ISO8601 durations with floating points
  const duration = talkingDuration
    ? dayjs.duration(talkingDuration).add(0, 's').format('HH:mm:ss')
    : '00:00:00';

  const actions: Array<{ icon: ReactNode, title: string, onClick: MouseEventHandler }> = useMemo(() => {
    const actions = [];
    if (extCaller.phoneNumber) {
      actions.push({
        icon: <PhoneIcon />,
        title: t('Make Call'),
        onClick: () => makeCall(extCaller.phoneNumber!)
      });
      if (extCaller.phoneBookId) {
        actions.push({
          icon: <IdentificationIcon />,
          title: t('Show Contact'),
          onClick: () => editContact(extCaller.phoneBookId!)
        });
      } else {
        actions.push({
          icon: <PlusIcon />,
          title: t('Add Contact'),
          onClick: () => addContact(extCaller.phoneNumber!)
        });
      }
    }
    return actions;
  }, [extCaller, t]);


  return (
    <div className="py-3 px-4 grid grid-cols-[60px_1fr_2fr_88px] gap-10 items-center">
      <div className="flex items-center flex-col whitespace-nowrap">
        <div className="flex-shrink-0 h-7 w-7">
          {direction === 'incoming'
            ? <PhoneIncomingIcon className="-scale-x-100 text-green-600" />
            : <PhoneOutgoingIcon className="text-red-600" />
          }
        </div>
        <span className="text-xs text-gray-500">
          {direction === 'incoming' ? t('Incoming') : t('Outgoing')}
        </span>
      </div>

      <div className="flex items-center">
        <div className="ml-0">
          <div className="text-sm font-medium text-gray-900 whitespace-pre-wrap">
            {t('{{val, datetime}}', {
              val: new Date(startTime), formatParams: {
                val: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }
              }
            })}
          </div>
          <div className="mt-1 text-xs font-medium text-gray-500 whitespace-pre-wrap">
            {answered 
              ? (
                <span className="px-2 inline-flex items-center py-1 leading-none rounded-full bg-green-100 text-green-800">
                  <ClockIcon className="h-3.5 w-3.5 mr-1" />
                  {duration}
                </span>
              ) : (
                <span title={t('Not Answered')} className="px-2 inline-flex items-center py-1 leading-none rounded-full bg-red-100 text-red-800">
                  <XIcon className="h-3.5 w-3.5 mr-0.5" />
                  {duration}
                </span>
              )
            }
          </div>
        </div>
      </div>

      <div>
        <div className="text-gray-500 font-semibold text-[10px]">
          {direction === 'incoming' ? t('From') : t('To')}
        </div>
        <div className="text-gray-900 font-semibold leading-5">
          <Caller callerInfo={extCaller} />
        </div>
        <div className="text-gray-500 font-semibold text-[10px] mt-1 -mb-1">
          {direction === 'incoming' ? t('To') : t('From')}
        </div>
        <div className="text-sm leading-4 text-gray-500 inline-flex items-center flex-wrap">
          {segments.map(({ direction, segmentId, from, to }) => (
            <React.Fragment key={segmentId}>
              <Caller callerInfo={direction === 'incoming' ? to : from} />
              <span className="last:hidden"><ArrowSmRightIcon className="h-4 w-4 mx-1" /></span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="whitespace-nowrap text-right">
          {actions.map(({ icon, title, onClick }) => (
            <button
              key={title}
              className="h-10 w-10 inline-flex items-center justify-center px-2 py-2 rounded-md text-gray-500 bg-gray-50 hover:bg-gray-300 hover:text-gray-900 mr-2 last:mr-0"
              title={title}
              onClick={onClick}
            >
              {icon}
            </button>
          ))}
      </div>
    </div>
  );
}