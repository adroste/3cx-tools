import { ConsoleClient, DashboardClient, IHttpClient, SettingsClient, createClient } from '@adroste/3cx-api';
import { ReactNode, createContext, useCallback, useEffect, useMemo, useState } from 'react';

import { Axios } from 'axios';

export interface ICxContext {
  api?: ConsoleClient,
  dashboardApi?: DashboardClient,
  httpClient?: IHttpClient,
  loggedIn: boolean,
  login?: (username: string, password: string) => Promise<void>,
  settingsApi?: SettingsClient,
}

export const cxContext = createContext<ICxContext>({
  loggedIn: false,
});

const BACKEND_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:8010' : '/';

export function CxContextProvider({ children }: { children: ReactNode }) {
  const [httpClient, setHttpClient] = useState<IHttpClient>();
  const [api, setApi] = useState<ConsoleClient>();
  const [settingsApi, setSettingsApi] = useState<SettingsClient>();
  const [dashboardApi, setDashboardApi] = useState<DashboardClient>();
  const [loggedIn, setLoggedIn] = useState(false);

  const login = useCallback(async (username: string, password: string) => {
    const httpClient = await createClient(BACKEND_URL, { Username: username, Password: password });

    (httpClient as Axios).interceptors.response.use(response => response, error => {
      if (error.response.status === 401) { // unauthorized
        setLoggedIn(false);
      } 
      return Promise.reject(error);
    });

    const api = new ConsoleClient(httpClient);
    const settingsApi = new SettingsClient(httpClient);
    const dashboardApi = new DashboardClient(httpClient);
    setHttpClient(httpClient);
    setApi(api);
    setSettingsApi(settingsApi);
    setDashboardApi(dashboardApi);
    setLoggedIn(true);

    // save login infos
    localStorage.setItem('tcx-tools-api-login-user', username);
    localStorage.setItem('tcx-tools-api-login-pw', password);
  }, []);

  // auto-login after page reload or after 401 (session expired)
  useEffect(() => {
    if (loggedIn)
      return;
    // save login infos
    const username = localStorage.getItem('tcx-tools-api-login-user');
    const password = localStorage.getItem('tcx-tools-api-login-pw');
    try {
      if (username && password)
        login(username, password);
    } catch (e) {
      localStorage.removeItem('tcx-tools-api-login-user');
      localStorage.removeItem('tcx-tools-api-login-pw');
    }
  }, [loggedIn, login]);

  const context = useMemo(() => ({
    api,
    dashboardApi,
    httpClient,
    loggedIn,
    login,
    settingsApi,
  }), [api, dashboardApi, httpClient, loggedIn, login, settingsApi]);

  return (
    <cxContext.Provider value={context}>
      {children}
    </cxContext.Provider>
  );
}