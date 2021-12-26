import { getDb } from '../database';

interface ParameterRow {
  name: string,
  idparameter: number,
  description?: string,
  parametertype: number,
  value?: string,
}

export async function queryParameter(parameter: string): Promise<(string | undefined)> {
  const res = await getDb().query(`SELECT value FROM public.parameter WHERE name = $1`, [parameter]);
  const rows = res.rows as ParameterRow[];
  return rows[0]?.value || undefined;
}