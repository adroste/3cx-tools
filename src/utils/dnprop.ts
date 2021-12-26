import { getDb } from '../database';

export async function queryDnPropValue(dn: string, propName: string): Promise<(string | undefined)> {
  const res = await getDb().query(`
SELECT p.name, p.value 
FROM dn
LEFT JOIN public.dnprop p
	on dn.iddn = p.fkiddn
WHERE dn.value = $1 AND p.name = $2
`, [dn, propName]);
  const rows = res.rows as { name: string, value?: string }[];
  return rows[0]?.value || undefined;
}