import { useContext, useEffect, useState } from 'react';

import { CallLog } from './wsApiTypes';
import { wsApiContext } from './WsApiContext';

export function useCallLogs(): CallLog[] {
  const { wsApi } = useContext(wsApiContext);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);

  useEffect(() => {
    if (!wsApi)
      return;
    const handler = (_: unknown) => {
      setTimeout(() => setCallLogs(wsApi.cache.callLogs), 0);
    }
    wsApi.subscribeCallLogs(handler);
    return () => wsApi.unsubscribeCallLogs(handler);
  }, [wsApi]);

  return callLogs;
}