import { useContext, useEffect, useState } from 'react';

import { CallLog } from './wsApiTypes';
import { wsApiContext } from './WsApiContext';

export function useCallLogs(limit: number): CallLog[] {
  const { wsApi } = useContext(wsApiContext);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);

  useEffect(() => {
    if (!wsApi)
      return;
    const handler = (callLogs: CallLog[]) => {
      setCallLogs(oldLogs => [
        ...callLogs.slice(0, limit),
        ...oldLogs.slice(0, Math.max(limit - callLogs.length, 0))
      ]);
    }
    wsApi.subscribeCallLogs(handler);
    return () => wsApi.unsubscribeCallLogs(handler);
  }, [limit, wsApi]);

  return callLogs;
}