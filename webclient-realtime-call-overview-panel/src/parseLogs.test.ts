import { calcTotalDuration, detectIncomingOutgoing, parseDuration, parseLogs } from './parseLogs';

import { ICallLog } from '@adroste/3cx-api';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

describe('parseDuration', () => {
  it('should parse a Duration string in format HH:mm:ss', () => {
    const dur = parseDuration('01:23:45');
    expect(dur.seconds()).toBe(45);
    expect(dur.minutes()).toBe(23);
    expect(dur.hours()).toBe(1);
  });
});

describe('calcTotalDuration', () => {
  it('should format the returned date', () => {
    const o = [{ Duration: '10:34:25' }]
    const out = calcTotalDuration(o);
    expect(out).toEqual('10:34:25');
  });

  it('should correctly sum the durations', () => {
    const o = [{ Duration: '10:34:25' }, { Duration: '10:36:11' }]
    const out = calcTotalDuration(o);
    expect(out).toEqual('21:10:36');
  });

  it.skip('should correctly sum the durations above 24 hours', () => {
    const o = [{ Duration: '30:20:30' }, { Duration: '40:10:55' }]
    const out = calcTotalDuration(o);
    expect(out).toEqual('70:31:25');
  });
});


describe('detectIncomingOutgoing', () => {
  it('should detect incoming call', () => {
    expect(detectIncomingOutgoing({
      "CallTime": "2021-12-14T13:43:16+01:00",
      "CallerId": "+49123344566777",
      "Destination": "IVR (800)",
      "Duration": "00:00:06",
      "Answered": true
    })).toBe('incoming');
    expect(detectIncomingOutgoing({
      "CallTime": "2021-12-14T13:43:16+01:00",
      "CallerId": "ASFD, asdf (+49123344566777)",
      "Destination": "IVR (800)",
      "Duration": "00:00:06",
      "Answered": true
    })).toBe('incoming');
  });

  it('should detect outgoing call', () => {
    expect(detectIncomingOutgoing({
      "CallTime": "2021-12-14T13:55:46+01:00",
      "CallerId": "ABC DEF (100)",
      "Destination": "9999",
      "Duration": "00:00:01",
      "Answered": false
    })).toBe('outgoing');
  });

  it('should detect incoming call with forward to mobile', () => {
    expect(detectIncomingOutgoing({
      "CallTime": "2021-12-14T13:55:46+01:00",
      "CallerId": "+49123412341234",
      "Destination": "01234675465546",
      "Duration": "00:00:01",
      "Answered": false
    })).toBe('incoming');
  });

  it('should detect IVR to extension as incoming', () => {
    expect(detectIncomingOutgoing({
      "CallTime": "2021-12-14T13:55:46+01:00",
      "CallerId": "IVR (PlayFile)",
      "Destination": "ABCDEF (100)",
      "Duration": "00:00:01",
      "Answered": false
    })).toBe('incoming');
  })
});


describe('parseLogs', () => {
  it('should parse single incoming entry', () => {
    const incoming: ICallLog[] = [{
      Answered: false,
      CallTime: "2021-12-12T01:42:29+01:00",
      CallerId: "Mustermann, Max (+49123456789)",
      Destination: "Test Test (123)",
      Duration: "00:00:15",
    }];
    const logs = parseLogs(incoming);
    expect(logs[0]).toEqual({
      answered: false,
      chain: [{
        Answered: false,
        CallTime: "2021-12-12T01:42:29+01:00",
        CallerId: "Mustermann, Max (+49123456789)",
        Destination: "Test Test (123)",
        Duration: "00:00:15",
        Direction: 'incoming',
      }],
      direction: 'incoming',
      totalDuration: "00:00:15",
      extId: "Mustermann, Max (+49123456789)",
      time: "2021-12-12T01:42:29+01:00",
    });
  });

  it('should detect simple chain for incoming call of ivr, missed call and mailbox', () => {
    const incoming: ICallLog[] = [
      {
        "CallTime": "2021-12-11T18:14:12+01:00",
        "CallerId": "+1234556799",
        "Destination": "VMail (100)",
        "Duration": "00:00:17",
        "Answered": true
      },
      {
        "CallTime": "2021-12-11T18:13:42+01:00",
        "CallerId": "+1234556799",
        "Destination": "Max Mustermann (100)",
        "Duration": "00:00:30",
        "Answered": false
      },
      {
        "CallTime": "2021-12-11T18:13:22+01:00",
        "CallerId": "+1234556799",
        "Destination": "IVR (800)",
        "Duration": "00:00:20",
        "Answered": true
      }
    ];
    const logs = parseLogs(incoming);
    expect(logs).toHaveLength(1);
    expect(logs[0]).toEqual({
      answered: true,
      chain: [
        {
          "CallTime": "2021-12-11T18:13:22+01:00",
          "CallerId": "+1234556799",
          "Destination": "IVR (800)",
          "Duration": "00:00:20",
          "Answered": true,
          Direction: 'incoming'
        },
        {
          "CallTime": "2021-12-11T18:13:42+01:00",
          "CallerId": "+1234556799",
          "Destination": "Max Mustermann (100)",
          "Duration": "00:00:30",
          "Answered": false,
          Direction: 'incoming'
        },
        {
          "CallTime": "2021-12-11T18:14:12+01:00",
          "CallerId": "+1234556799",
          "Destination": "VMail (100)",
          "Duration": "00:00:17",
          "Answered": true,
          Direction: 'incoming'
        },
      ],
      direction: 'incoming',
      totalDuration: "00:01:07",
      extId: "+1234556799",
      time: "2021-12-11T18:13:22+01:00",
    });
  });

  it('should detect chain with call forwarding to ivr', () => {
    const incoming: ICallLog[] = [
      {
        "CallTime": "2021-12-14T13:43:16+01:00",
        "CallerId": "+1234556799",
        "Destination": "IVR (800)",
        "Duration": "00:00:06",
        "Answered": true
      },
      {
        "CallTime": "2021-12-14T13:42:53+01:00",
        "CallerId": "Alexander Droste (100)",
        "Destination": "+1234556799",
        "Duration": "00:00:23",
        "Answered": true
      },
    ];
    const logs = parseLogs(incoming);
    expect(logs).toHaveLength(1);
    expect(logs[0]).toEqual({
      answered: true,
      chain: [
        {
          "CallTime": "2021-12-14T13:42:53+01:00",
          "CallerId": "Alexander Droste (100)",
          "Destination": "+1234556799",
          "Duration": "00:00:23",
          "Answered": true,
          Direction: 'outgoing'
        },
        {
          "CallTime": "2021-12-14T13:43:16+01:00",
          "CallerId": "+1234556799",
          "Destination": "IVR (800)",
          "Duration": "00:00:06",
          "Answered": true,
          Direction: 'incoming'
        },
      ],
      direction: 'outgoing',
      totalDuration: "00:00:29",
      extId: "+1234556799",
      time: "2021-12-14T13:42:53+01:00",
    });
  });
});