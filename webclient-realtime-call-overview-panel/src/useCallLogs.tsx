import { ICallChain, parseLogs } from './parseLogs';
import { useCallback, useContext, useEffect, useState } from 'react';

import { ICallLogsParameters } from '@adroste/3cx-api';
import { cxContext } from './CxContext';

const defaultParams: ICallLogsParameters = {
  TimeZoneName: encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone), // get time zone of browser
  callState: 'All',
  dateRangeType: 'LastSevenDays',
  fromFilter: '',
  fromFilterType: 'Any',
  numberOfRows: 1000,
  searchFilter: '',
  startRow: 0,
  toFilter: '',
  toFilterType: 'Any',
};

export function useCallLogs(): [ICallChain[], () => Promise<void>] {
  const { api } = useContext(cxContext);
  const [callLogs, setCallLogs] = useState<ICallChain[]>([]);

  const refresh = useCallback(async () => {
    if (!api)
      return;
    const callLogList = await api.getCallLogList(defaultParams);
    const logs = parseLogs(callLogList.CallLogRows);
    setCallLogs(logs);
  }, [api]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return [callLogs, refresh];
}