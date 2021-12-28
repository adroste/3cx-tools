import { CallerInfo } from './call-logs';
import { EventEmitter } from 'events';
import { IActiveCalls } from '@adroste/3cx-api';
import { api } from '../api/connection';
import { getConfig } from '../config';
import { isEqual } from 'lodash';
import { resolveCaller } from './caller-id';

const TAG = '[Active Calls Monitor]';

const activeCallsMonitor = new EventEmitter();
let checkInterval: NodeJS.Timer, activeCalls: ActiveCall[];

export interface ActiveCall {
  id: number,
  establishedAt: string,
  from: CallerInfo,
  lastChangeStatus: string,
  status: string,
  to: CallerInfo,
}

function getPhoneNumberFromCallerId(callerId: string) {
  // format can be for instance: "Name name (+123456789)", "(123495)", "+4359090132"
  const test = /(^|\()([+]?\d{2,})($|\)$)/;
  const match = test.exec(callerId);
  if (match)
    return match[2];
  return undefined;
}

function stripPhoneNumberFromCallerId(callerId: string, phoneNumber: string) {
  return callerId
    .replace(phoneNumber, '')
    .replace(' ()', '');
}

function createCallerInfoFromCallerId(callerId: string): CallerInfo {
  const phoneNumber = getPhoneNumberFromCallerId(callerId);
  if (!phoneNumber)
    return { displayName: callerId };

  const entry = resolveCaller(phoneNumber);
  const callerIdWithoutNr = stripPhoneNumberFromCallerId(callerId, phoneNumber);
  return {
    displayName: entry?.displayName || callerIdWithoutNr,
    phoneNumber,
    phoneBookId: entry?.id || undefined,
  };
}

export function parseActiveCalls(activeCalls: IActiveCalls[]): ActiveCall[] {
  return activeCalls.map((c) => ({
    id: c.Id,
    establishedAt: c.EstablishedAt,
    from: createCallerInfoFromCallerId(c.Caller),
    lastChangeStatus: c.LastChangeStatus,
    status: c.Status,
    to: createCallerInfoFromCallerId(c.Callee),
  }));
}

export async function checkActiveCalls() {
  let nextActiveCallsRaw: IActiveCalls[];
  try {
    nextActiveCallsRaw = await api.dashboardClient.getActiveCalls();
  } catch (err) { 
    console.error(TAG, 'active calls check failed', err);
    return;
  }
  const nextActiveCalls = parseActiveCalls(nextActiveCallsRaw);
  if (isEqual(activeCalls, nextActiveCalls))
    return;
  activeCalls = nextActiveCalls;
  activeCallsMonitor.emit('change', nextActiveCalls);
}

export function getActiveCalls() {
  return activeCalls;
}

export function monitorActiveCalls() {
  checkInterval = setInterval(checkActiveCalls, 
    getConfig().activeCallsCheckIntervalMs);
  console.log(TAG, 'started');
}

export function stopMonitorActiveCalls() {
  clearInterval(checkInterval);
  console.log(TAG, 'stopped');
}

export function onActiveCallsChange(listener: (activeCalls: ActiveCall[]) => void) {
  activeCallsMonitor.on('change', listener);
}

export function offActiveCallsChange(listener: (activeCalls: ActiveCall[]) => void) {
  activeCallsMonitor.off('change', listener);
}