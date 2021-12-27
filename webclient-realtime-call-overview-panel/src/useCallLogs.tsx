import { useContext, useEffect, useState } from 'react';

import { CallLog } from './wsApiTypes';
import { wsApiContext } from './WsApiContext';

export function useCallLogs(): CallLog[] {
  const { wsApi } = useContext(wsApiContext);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);

  useEffect(() => {
    if (!wsApi)
      return;
    wsApi.subscribeCallLogs(setCallLogs);
    return () => wsApi.unsubscribeCallLogs(setCallLogs);
  }, [wsApi]);

  return callLogs;
}