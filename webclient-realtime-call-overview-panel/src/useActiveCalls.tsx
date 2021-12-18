import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { IActiveCalls } from '@adroste/3cx-api';
import { cxContext } from './CxContext';
import isEqual from 'lodash/isEqual';

const UPDATE_INTERVAL = 3000;

export function useActiveCalls(): [IActiveCalls[], () => Promise<void>] {
  const { dashboardApi } = useContext(cxContext);
  const [activeCalls, setActiveCalls] = useState<IActiveCalls[]>([]);
  const activeCallsRef = useRef<IActiveCalls[]>();

  const refresh = useCallback(async () => {
    if (!dashboardApi)
      return;
    const activeCalls = await dashboardApi.getActiveCalls();
    if (isEqual(activeCalls, activeCallsRef.current))
      return;
    activeCallsRef.current = activeCalls;
    setActiveCalls(activeCalls);
  }, [dashboardApi]);

  useEffect(() => {
    const interval = setInterval(refresh, UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [refresh]);

  return [activeCalls, refresh];
}