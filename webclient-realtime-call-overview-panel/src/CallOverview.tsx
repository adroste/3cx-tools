import { ArrowSmRightIcon, IdentificationIcon, PhoneIcon, PhoneIncomingIcon, PhoneOutgoingIcon, PlusIcon, XIcon } from '@heroicons/react/solid';
import { CallerId, usePhoneBook } from './usePhoneBook';
import React, { MouseEventHandler, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { addContact, editContact, makeCall } from './integrateUtils';

import { ClockIcon } from '@heroicons/react/outline';
import { IActiveCalls } from '@adroste/3cx-api';
import { ICallChain } from './parseLogs';
import dayjs from 'dayjs';
import { t } from 'i18next';
import { useActiveCalls } from './useActiveCalls';
import { useCallLogs } from './useCallLogs';
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

export function ActiveCallRow({ activeCall, callerId, calleeId }: { activeCall: IActiveCalls, callerId: CallerId, calleeId: CallerId }) {
  const { EstablishedAt, Status } = activeCall;
  const { t } = useTranslation();
  const [duration, setDuration] = useState('00:00:00');

  useEffect(() => {
    const start = dayjs(EstablishedAt);
    const update = () => {
      const diff = dayjs.duration(dayjs().diff(start));
      setDuration(diff.format('HH:mm:ss'));
    };
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [EstablishedAt]);

  return (
    <tr className="bg-lime-200">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="flex items-center flex-col">
            <div className="flex-shrink-0 h-7 w-7">
              <PhoneIcon className="-scale-x-100 text-blue-500" />
            </div>
            <span className="text-xs text-gray-500">
              {translateActiveCallStatus(Status)}
            </span>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="ml-0">
            <div className="text-sm font-medium text-gray-900">
              {t('{{val, datetime}}', {
                val: new Date(EstablishedAt), formatParams: {
                  val: { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }
                }
              })}
            </div>
            <div className="mt-1 text-xs font-medium text-gray-500">
              <span className="px-2 inline-flex items-center leading-5 rounded-full bg-blue-100 text-green-800">
                <ClockIcon className="h-3.5 w-3.5 mr-1" />
                {duration}
              </span>
            </div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap align-top text-right">
        <div className="text-gray-500 font-semsibold -mr-8">
          {`${t('Caller')}: `}
        </div>
        <div className="text-gray-500 inline-flex -mr-8 mt-2">
          {`${t('Callee')}: `}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-gray-900 font-semibo2ld">
          {callerId.display}
        </div>
        <div className="text-gray-900 inline-flex items-center mt-2">
          {calleeId.display}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-right">
      </td>
    </tr>
  );
}


export function CallOverviewRow({ callChain, callerId }: { callChain: ICallChain, callerId: CallerId }) {
  const { answered, chain, direction, extId, time, totalDuration } = callChain;
  const { t } = useTranslation();

  const actions: Array<{ icon: ReactNode, title: string, onClick: MouseEventHandler }> = useMemo(() => {
    const actions = [];
    if (callerId.phoneNumber) {
      actions.push({
        icon: <PhoneIcon />,
        title: t('Make Call'),
        onClick: () => makeCall(callerId.phoneNumber!)
      });
      if (callerId.phoneBookEntry) {
        actions.push({
          icon: <IdentificationIcon />,
          title: t('Show Contact'),
          onClick: () => editContact(callerId.phoneBookEntry!.Id)
        });
      } else {
        actions.push({
          icon: <PlusIcon />,
          title: t('Add Contact'),
          onClick: () => addContact(callerId.phoneNumber!)
        });
      }
    }
    return actions;
  }, [callerId, t]);


  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="flex items-center flex-col">
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
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="ml-0">
            <div className="text-sm font-medium text-gray-900">
              {t('{{val, datetime}}', {
                val: new Date(time), formatParams: {
                  val: { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }
                }
              })}
            </div>
            <div className="mt-1 text-xs font-medium text-gray-500">
              {answered
                ? (
                  <span className="px-2 inline-flex items-center leading-5 rounded-full bg-green-100 text-green-800">
                    <ClockIcon className="h-3.5 w-3.5 mr-1" />
                    {totalDuration}
                  </span>
                ) : (
                  <span className="px-2 inline-flex items-center leading-5 rounded-full bg-red-100 text-red-800">
                    <XIcon className="h-3.5 w-3.5 mr-0.5" />
                    {t('Not Answered')}
                  </span>
                )
              }
            </div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap align-top text-right">
        <div className="text-gray-500 font-semibold -mr-8">
          {`${direction === 'incoming' ? t('From') : t('To')}: `}
        </div>
        <div className="text-sm text-gray-500 inline-flex -mr-8">
          {`${direction === 'incoming' ? t('To') : t('From')}: `}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-gray-900 font-semibold">
          {callerId.display}
        </div>
        <div className="text-sm text-gray-500 inline-flex items-center">
          {chain.map(({ CallerId, Destination, Direction, CallTime }) => (
            <React.Fragment key={`${CallTime}-${CallerId}-${Destination}`}>
              <span>{Direction === 'incoming' ? Destination : CallerId}</span>
              <span className="last:hidden"><ArrowSmRightIcon className="h-4 w-4 mx-1" /></span>
            </React.Fragment>
          ))}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="">
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
      </td>
    </tr>
  );
}

export function CallOverview() {
  const { t } = useTranslation();
  const [resolveCaller,] = usePhoneBook();
  const [callLogs, refreshCallLogs] = useCallLogs();
  const [activeCalls,] = useActiveCalls();
  const activeCallIdsRef = useRef<number[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeIds = activeCalls.map(({ Id }) => Id);
    // refresh call logs everytime active-calls change (by comparing the ids)
    if (
      activeIds.length !== activeCallIdsRef.current.length
      || !activeIds.every((id) => activeCallIdsRef.current.includes(id))
    ) {
      activeCallIdsRef.current = activeIds;
      refreshCallLogs();

      // scroll back to top, so the user can't miss out on new calls
      wrapperRef.current?.scrollTo(0,0);
    }
  }, [activeCalls, refreshCallLogs]);

  return (
    <div className="overflow-y-scroll overflow-x-auto h-full max-h-full" ref={wrapperRef}>

      <table className="min-w-full divide-y divide-gray-200">

        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {[t('Type'), t('Date'), '', t('Call details'), ''].map((el, i) =>
              <th key={i} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {el}
              </th>
            )}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {activeCalls.map(activeCall => (
            <ActiveCallRow
              key={activeCall.Id}
              activeCall={activeCall}
              callerId={resolveCaller(activeCall.Caller)}
              calleeId={resolveCaller(activeCall.Callee)}
            />
          ))}
          {callLogs.map(callChain => (
            <CallOverviewRow
              key={`${callChain.chain[0].CallTime}-${callChain.chain[0].CallerId}-${callChain.chain[0].Destination}`}
              callChain={callChain}
              callerId={resolveCaller(callChain.extId)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}