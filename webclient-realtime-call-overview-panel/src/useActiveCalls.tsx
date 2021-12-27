import { useContext, useEffect, useState } from 'react';

import { IActiveCalls } from './wsApiTypes';
import { wsApiContext } from './WsApiContext';

export function useActiveCalls(): IActiveCalls[] {
  const { wsApi } = useContext(wsApiContext);
  const [activeCalls, setActiveCalls] = useState<IActiveCalls[]>([]);

  useEffect(() => {
    if (!wsApi)
      return;
    wsApi.subscribeActiveCalls(setActiveCalls);
    return () => wsApi.unsubscribeActiveCalls(setActiveCalls);
  }, [wsApi]);

  return activeCalls;
}