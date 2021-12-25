import { ConsoleClient, DashboardClient, IHttpClient, createClient } from '@adroste/3cx-api';

import { Axios } from 'axios';
import { getDb } from '../database';

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
  const httpClient = await createClient('http://localhost:5000',
   { Username: credentials.username, Password: credentials.password });

  (httpClient as Axios).interceptors.response.use(response => response, error => {
    if (error.response.status === 401) { // unauthorized
      connectTo3cxApi(); // self healing
    } 
    return Promise.reject(error);
  });

  api = {
    httpClient,
    consoleClient: new ConsoleClient(httpClient),
    dashboardClient: new DashboardClient(httpClient),
  };
}
