import { ConsoleClient, DashboardClient, IHttpClient, createClient } from '@adroste/3cx-api';

import { Axios } from 'axios';
import { getDb } from '../database';

const TAG = '[3CX REST API]';
const RECONNECT_MAX_TRY = 1000;
let reconnectTimeout: NodeJS.Timer | null = null;

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

function reconnectLoop(i = 1) {
  if (reconnectTimeout)
    return;

  if (i === RECONNECT_MAX_TRY)
    throw new Error('3cx rest api max reconnect attempts exceeded');

  reconnectTimeout = setTimeout(async () => {
    try {
      await connectTo3cxApi();
    } catch (err) {
      console.error(TAG, `reconnect failed (${i}), trying againg...`);
      reconnectTimeout = null;
      reconnectLoop(i + 1);
    }
  }, 1000);
}

export async function connectTo3cxApi() {
  const credentials = await getApiLoginCredentials();
  const httpClient = await createClient('http://localhost:5000',
   { Username: credentials.username, Password: credentials.password });

  console.log(TAG, 'connected');

  (httpClient as Axios).interceptors.response.use(response => response, error => {
    if (
      !error?.response // service down
      || error.response.status === 401 // unauthorized
    ) { 
      reconnectLoop(); // self healing
    } 
    return Promise.reject(error);
  });

  api = {
    httpClient,
    consoleClient: new ConsoleClient(httpClient),
    dashboardClient: new DashboardClient(httpClient),
  };
}
