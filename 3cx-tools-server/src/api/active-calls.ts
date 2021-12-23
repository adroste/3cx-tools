import { EventEmitter } from 'events';
import { IActiveCalls } from '@adroste/3cx-api';
import { api } from './connection';
import { getConfig } from '../config';
import { isEqual } from 'lodash';

const TAG = '[Active Calls Monitor]';

const activeCallsMonitor = new EventEmitter();
let checkInterval: NodeJS.Timer, activeCalls: IActiveCalls[];

export async function checkActiveCalls() {
  const nextActiveCalls = await api.dashboardClient.getActiveCalls();
  if (isEqual(activeCalls, nextActiveCalls))
    return;
  activeCalls = nextActiveCalls;
  activeCallsMonitor.emit('change', activeCalls);
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

export function onActiveCallsChange(listener: (activeCalls: IActiveCalls[]) => void) {
  activeCallsMonitor.on('change', listener);
}

export function offActiveCallsChange(listener: (activeCalls: IActiveCalls[]) => void) {
  activeCallsMonitor.off('change', listener);
}