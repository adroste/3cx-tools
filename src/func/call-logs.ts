import { offActiveCallsChange, onActiveCallsChange } from './active-calls';

import { EventEmitter } from 'events';
import { getDb } from '../database';
import { resolveCaller } from './caller-id';

const TAG = '[Call Log Monitor]';
const CALL_LOG_LIMIT = 1000;
const callLogsMonitor = new EventEmitter();
let callLogs: CallLog[] = [];

export type IncomingOutgoing = 'incoming' | 'outgoing';
export type CallerType = 'IVR' | 'Voicemail' | 'Internal' | 'External' | 'Other'

export interface CallerInfo {
  displayName?: string,
  phoneBookId?: number, // foreign key of public.phonebook.idphonebook
  phoneNumber?: string,
  type: CallerType,
}

export interface CallSegment {
  direction: IncomingOutgoing,
  endTime: string;
  from: CallerInfo;
  segmentId: number,
  startTime: string;
  to: CallerInfo;
}

export interface CallLog {
  id: number,
  answered: boolean,
  direction: IncomingOutgoing,
  endTime: string,
  extCaller: CallerInfo,
  segments: CallSegment[],
  startTime: string,
  talkingDuration?: string,
}

interface IPostgresInterval {
  years?: number;
  months?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
  toPostgres(): string;
  toISO(): string;
  toISOString(): string;
}

interface ClCallsRows {
  id: number,
  start_time: string,
  end_time: string,
  is_answered: boolean,
  talking_dur?: IPostgresInterval,
}

interface ClSegmentsJoinedClPartyInfoRow {
  call_id: number,
  segment_id: number,
  start_time: string,
  end_time: string,
  src_dn?: string,
  src_dn_type?: number,
  src_caller_number?: string,
  src_display_name?: string,
  dst_dn?: string,
  dst_dn_type?: number,
  dst_caller_number?: string,
  dst_display_name?: string,
}

let activeCallsHookTimers: NodeJS.Timer[] = [];
/**
 * It is not possible to instantly query the call logs after activeCalls changed.
 * Therefore this utility tries to compensate cached/delayed db writes from 3cX. 
 * The call logs update will performed three times: 
 * 1st time after 1 second, 2nd time after 10 seconds, 3rd time after 60 seconds.
 * This function debounces itself.
 */
function activeCallsChangeUpdateHook() {
  activeCallsHookTimers.forEach(timer => clearTimeout(timer));
  activeCallsHookTimers = [
    setTimeout(updateCallLogs, 1000),
    setTimeout(updateCallLogs, 10000),
    setTimeout(updateCallLogs, 60000),
  ];
}

export async function updateCallLogs() {
  // callLogs ordered descending, therefore first element = newest element
  const nextId = callLogs[0]?.id + 1 || 0;
  const newLogs = await queryCallLogs(nextId);
  if (newLogs.length > 0) {
    callLogs = [
      ...newLogs,
      ...callLogs.slice(0, CALL_LOG_LIMIT - newLogs.length)
    ];
    callLogsMonitor.emit('callLogs', newLogs);
  }
}

export function monitorCallLogs() {
  updateCallLogs();
  onActiveCallsChange(activeCallsChangeUpdateHook);
  console.log(TAG, 'started');
}

export function stopMonitorCallLogs() {
  offActiveCallsChange(activeCallsChangeUpdateHook);
  console.log(TAG, 'stopped');
}

export function getCallLogs() {
  return callLogs;
}

export function onCallLogs(listener: (callLogs: CallLog[]) => void) {
  callLogsMonitor.on('callLogs', listener);
}

export function offCallLogs(listener: (callLogs: CallLog[]) => void) {
  callLogsMonitor.off('callLogs', listener);
}

function getCallerTypeFromDnType(dnType?: number): CallerType {
  switch (dnType) {
    case 0: return 'Internal';
    case 1: return 'External';
    case 5: return 'Voicemail';
    case 6: return 'IVR';
    default: return 'Other';
  }
}

function clPartyInfoToCallerInfo(dn?: string, dnType?: number, callerNumber?: string, displayName?: string): CallerInfo {
  const type = getCallerTypeFromDnType(dnType);
  if (type === 'External') {
    // get callerId as 3CX does not add callerId to outgoing calls
    // this also enables callerId for calls in the past
    const entry = resolveCaller(callerNumber); 
    return {
      displayName: entry?.displayName || displayName,
      phoneNumber: callerNumber,
      phoneBookId: entry?.id || undefined,
      type
    }
  } else {
    return {
      displayName,
      phoneNumber: dn,
      type
    }
  }
}

/**
 * Returns CallLog[] in descending order (from new to old)
 * @param minCallId minimum callId to query
 * @returns 
 */
async function queryCallLogs(minCallId: number): Promise<CallLog[]> {
  const callsRes = await getDb().query(`
SELECT * FROM public.cl_calls 
WHERE id >= $1
ORDER BY id DESC 
LIMIT $2
`, [minCallId, CALL_LOG_LIMIT]); // Reminder: ordered descending
  const calls = callsRes.rows as ClCallsRows[];
  if (calls.length === 0)
    return [];
  const maxCallId = calls[0].id; // because of ordered, first element must be "newest"
  const segmentsRes = await getDb().query(`
SELECT call_id, cl_segments.id as segment_id, start_time, end_time, 
	src.dn AS src_dn, src.dn_type as src_dn_type, src.caller_number as src_caller_number, src.display_name as src_display_name, 
	dst.dn AS dst_dn, dst.dn_type as dst_dn_type, dst.caller_number as dst_caller_number, dst.display_name as dst_display_name 
FROM public.cl_segments
LEFT JOIN public.cl_party_info src 
	ON src_part_id = src.id
LEFT JOIN public.cl_party_info dst
	on dst_part_id = dst.id
WHERE call_id >= $1 AND call_id <= $2
  AND action_id != 1
ORDER BY call_id ASC, seq_order ASC
`, [minCallId, maxCallId]);
  // ASSUMPTION: action_id != 1 filters unwanted rows, maybe 1 means redirect? or connect? 
  //              => i don't know but it kind of works
  // Reminder: ordered ascending
  const segments = segmentsRes.rows as ClSegmentsJoinedClPartyInfoRow[];

  const segmentsById = segments.reduce((segmentsById, s) => {
    if (!segmentsById[s.call_id])
      segmentsById[s.call_id] = [];
    const from = clPartyInfoToCallerInfo(s.src_dn, s.src_dn_type, s.src_caller_number, s.src_display_name);
    const to = clPartyInfoToCallerInfo(s.dst_dn, s.dst_dn_type, s.dst_caller_number, s.dst_display_name);
    segmentsById[s.call_id].push({
      // src dn_type = 0 => outgoing
      direction: from.type === 'Internal' ? 'outgoing' : 'incoming',
      endTime: s.end_time,
      from,
      segmentId: s.segment_id,
      startTime: s.start_time,
      to,
    });
    return segmentsById;
  }, {} as { [id: number]: CallSegment[] });

  const callLogs: CallLog[] = calls.map(call => {
    const segments = segmentsById[call.id];
    let extCaller: CallerInfo = segments[0].direction === 'incoming'
      ? segments[0].from : segments[0].to;
    for (const segment of segments) {
      if (segment.from.type === 'External') {
        extCaller = segment.from;
        break;
      } else if (segment.to.type === 'External') {
        extCaller = segment.to;
        break;
      }
    }
    return {
      id: call.id,
      answered: call.is_answered,
      direction: segments[0].direction,
      endTime: call.end_time,
      segments,
      extCaller,
      startTime: call.start_time,
      talkingDuration: call.talking_dur?.toISOString(),
    };
  });

  return callLogs;
}