import { ConsoleClient, DashboardClient, IHttpClient, createClient, login } from '@adroste/3cx-api';

import { Axios } from 'axios';
import { getDb } from '../database';

const TAG = '[3CX REST API]';

export let api: {
  httpClient: IHttpClient,
  consoleClient: ConsoleClient,
  dashboardClient: DashboardClient,
};

async function getApiLoginCredentials() {
  const res = await getDb().query(`SELECT name,value FROM public.parameter WHERE name='WEBSERVERUSER' OR name ='WEBSERVERPASS'`);
  const rows = res.rows as { name: string, value: string }[];
  const table = rows.reduce((table: { [key: string]: string }, cur) => { 
    table[cur.name] = cur.value; 
    return table; 
  }, {});
  return {
    username: table['WEBSERVERUSER'],
    password: table['WEBSERVERPASS'],
  } as const;
}

export async function connectTo3cxApi() {
  const credentials = await getApiLoginCredentials();
  const creds = { Username: credentials.username, Password: credentials.password };
  const httpClient = await createClient('http://localhost:5000', creds);

  console.log(TAG, 'connected');

  let authorizing: Promise<void> | null = null;
  (httpClient as Axios).interceptors.response.use(response => response, error => {
    if (
      error?.response?.status !== 401 // everything but unauthorized
    ) {
      return Promise.reject(error);
    }

    // self healing
    // create pending authorization
    authorizing ??= login(httpClient, creds)
      .finally(() => authorizing = null)
      .then(data => {
        if (data !== 'AuthSuccess')
          return Promise.reject(error);
        return Promise.resolve();
      })
      .catch(error => Promise.reject(error));

    const originalRequestConfig = error.config;
    delete originalRequestConfig.headers['Cookie']; // use from defaults
    delete originalRequestConfig.httpAgent;
    delete originalRequestConfig.httpsAgent;
    delete originalRequestConfig.jar;

    // delay original requests until authorization has been completed
    return authorizing.then(() => (httpClient as Axios).request(originalRequestConfig));
  });

  api = {
    httpClient,
    consoleClient: new ConsoleClient(httpClient),
    dashboardClient: new DashboardClient(httpClient),
  };
}
