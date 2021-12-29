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
  // format can be for instance: "Name name (+123456789)", "(123495)", "+4359090132", "1234 Name name"
  // minimum 2 digits as 3CX extensions/dns can have 2,3 or 4 numbers
  const test1 = /\(([+]?\d{2,})\)$/; // check for number in parenthesis
  const test2 = /^([+]?\d{2,})/; // check for number at the beginning
  const match1 = test1.exec(callerId);
  const match2 = test2.exec(callerId);
  // match in parenthesis has priority
  return match1?.[1] || match2?.[1] || undefined;
}

function stripPhoneNumberFromCallerId(callerId: string, phoneNumber: string) {
  return callerId
    .replace(phoneNumber, '')
    .replace('()', '')
    .trim();
}

export function createCallerInfoFromCallerId(callerId: string): CallerInfo {
  const phoneNumber = getPhoneNumberFromCallerId(callerId);
  if (!phoneNumber)
    return { displayName: callerId };

  const entry = resolveCaller(phoneNumber);
  const callerIdWithoutNr = stripPhoneNumberFromCallerId(callerId, phoneNumber);
  return {
    displayName: entry?.displayName || callerIdWithoutNr || undefined,
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