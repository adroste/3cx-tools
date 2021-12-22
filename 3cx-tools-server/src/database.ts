import { Pool } from 'pg';
import { getPath } from './path';
import { readJson } from 'fs-extra';

interface TcxConfig {
  DbHost: string,
  DbPort: string,
  DbUser: string,
  DbPassword: string,
  DbName: string,
}

let pool: Pool;

export function getDb() {
  if (!pool)
    throw new Error('database pool was not initialized')
  return pool;
}

export async function initDb() {
  const tcxConfig = await readJson(getPath().configJson) as TcxConfig;

  pool = new Pool({
    user: tcxConfig.DbUser,
    host: tcxConfig.DbHost,
    database: tcxConfig.DbName,
    password: tcxConfig.DbPassword,
    port: parseInt(tcxConfig.DbPort),
  });
}

export async function closeDb() {
  return pool.end();
}
