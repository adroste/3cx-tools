import { ICallLog } from '@adroste/3cx-api';
import dayjs from 'dayjs';

export type IncomingOutgoing = 'incoming' | 'outgoing';

export interface IExtendedCallLog extends ICallLog {
  Direction: IncomingOutgoing,
}

export interface ICallChain {
  answered: boolean,
  chain: IExtendedCallLog[],
  direction: IncomingOutgoing,
  totalDuration: string,
  extId: string,
  time: string,
}

/**
 * Parses a duration strings
 * @param duration in format HH:mm:ss
 * @returns dayjs.duration
 */
export function parseDuration(duration: string) {
  const parts = duration.split(':').map(d => parseInt(d));
  return dayjs.duration({
    hours: parts[0],
    minutes: parts[1],
    seconds: parts[2],
  });
}

export function calcTotalDuration(chain: Array<{ Duration: string }>) {
  const durations = chain.map(({ Duration }) => parseDuration(Duration));
  const totalDuration = durations.reduce((total, d) => total.add(d), dayjs.duration({seconds: 0}));
  return totalDuration.format('HH:mm:ss');
}

export function detectIncomingOutgoing(log: ICallLog): IncomingOutgoing {
  // 3cx supports 2,3,4 digit extensions
  const re = /^.*\([1-9]\d{1,3}\)$/;
  if (re.test(log.CallerId))
    return 'outgoing';
  return 'incoming';
}

/**
 * Parses call logs and detects meta information (incoming, outgoing, chains).
 * @param callLogs must be ordered descending (CallTime)
 * @returns 
 */
export function parseLogs(callLogs: ICallLog[]): ICallChain[] {
  const parsedLogs: ICallChain[] = [];

  // logs are in reverse order, reverse them to be able to iterate from old to new
  callLogs = [...callLogs].reverse();

  // add Direction attribute
  let logs: IExtendedCallLog[] = callLogs.map((cl) => ({
    ...cl,
    Direction: detectIncomingOutgoing(cl)
  }));

  for (let i = 0; i < logs.length; ++i) {
    const chain = [logs[i]];
    const extId = logs[i].Direction === 'incoming' ? logs[i].CallerId : logs[i].Destination;

    // detect chains

    let last = chain[0];
    let nextTime = dayjs(last.CallTime).add(parseDuration(last.Duration));
    // allowed margin of error = 1 second
    let nextTimeInterval = [nextTime.subtract(1, 'second'), nextTime.add(1, 'second')];

    for (let j = i + 1; j < logs.length; ++j) {
      const cur = logs[j];
      const curCallTime = dayjs(cur.CallTime);
      if (curCallTime.isAfter(nextTimeInterval[1])) { 
        break; // no further chain possible if CallTime > nextTime[1] because logs are sorted by CallTime (ascending)
      } else if (curCallTime.isBefore(nextTimeInterval[0])) {
        continue; // still possible that another chain member can be found
      } else if ( // => only evaluated if: nextTime[0] <= curCallTime <= nextTime[1]
        cur.CallerId === extId // in case of call forward (e.g. ivr -> extension -> voice-mail)
        || cur.Destination === extId // just in case of weird forward option I don't know about yet (? todo check that this is even possible)
      ) { 
        // chain member found
        chain.push(cur);
        last = cur;
        nextTime = dayjs(last.CallTime).add(parseDuration(last.Duration));
        // allowed margin of error = 1 second
        nextTimeInterval = [nextTime.subtract(1, 'second'), nextTime.add(1, 'second')];
        // remove chain element from incoming list
        logs.splice(j, 1);
        --j; // fix index to compensate for removed element
      } 
    }

    parsedLogs.push({
      answered: chain[chain.length - 1].Answered,
      chain,
      direction: chain[0].Direction,
      extId,
      time: chain[0].CallTime,
      totalDuration: calcTotalDuration(chain),
    });
  }

  // reverse reverse operation to return parsed logs in descending order
  return parsedLogs.reverse();
}