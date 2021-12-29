import { ActiveCall, onActiveCallsChange } from '../func/active-calls';
import { RecordIvrAction, recordIvr } from './ivr';

import { api } from '../api/connection';
import { getConfig } from '../config';

const TAG = '[Dial Code API]';

export const DialCodeActionTypes = {
  RECORD_IVR: 'RecordIvr',
} as const;

export interface DialCodeAction {
  type: typeof DialCodeActionTypes[keyof typeof DialCodeActionTypes],
  allowedExtensions: string, // like: "*", "100", "100,200", "105-115"
}

export interface DialCodes {
  [key: string]: DialCodeAction
}

/**
 * Parses string input like '1,3-6,12' into an array 
 * @param input 
 */
function parseValueRangeStringList(input: string) {
  function createRange(start: number, end: number) {
    if (isNaN(start) || isNaN(end) || end - start < 0)
      return [];
    return Array.from(new Array(end - start + 1), (_, i) => i + start)
  }
  const numbers = [];
  for (const raw of input.split(',')) {
    const nums = raw.split('-').map(n => parseInt(n));
    if (nums.some(isNaN))
      continue;
    if (nums.length === 2) {
      numbers.push(...createRange(nums[0], nums[1]));
    } else {
      numbers.push(nums[0]);
    }
  }
  return numbers;
}

/**
 * The Dial Code API works by checking active calls.
 * If a call is made to a recognized dial code,
 * the call is dropped instantly and a predefined action is performed.
 * @param activeCalls 
 */
function handleActiveCalls(activeCalls: ActiveCall[]) {
  const codes = getConfig().dialCodes || {};
  activeCalls.forEach((call) => {
    if (!call.to.phoneNumber || !call.from.phoneNumber)
      return;

    const action = codes[call.to.phoneNumber];
    if (!action)
      return;

    if (action.allowedExtensions.trim() !== '*') {
      const allowed = parseValueRangeStringList(action.allowedExtensions);
      if (!allowed.includes(parseInt(call.from.phoneNumber)))
        return;
    }

    api.dashboardClient.dropActiveCall(call.id);
    executeAction(action, call);
  });
}

export function initDialCodeApi() {
  onActiveCallsChange(handleActiveCalls);
  console.log(TAG, `listening for calls...`);
}

export async function executeAction(action: DialCodeAction, call: ActiveCall) {
  console.log(TAG, `execute action "${action.type}", dial code: "${call.to.phoneNumber}", caller: "${call.from.phoneNumber}"`);
  try {
    switch (action.type) {
      case DialCodeActionTypes.RECORD_IVR:
        await recordIvr(action as RecordIvrAction, call);
        break;
      default:
        console.error(TAG, 'dial code action unknown: ', action.type);
        return;
    }
  } catch (err) {
    console.error(TAG, 'dial code action failed', err);
  }
}