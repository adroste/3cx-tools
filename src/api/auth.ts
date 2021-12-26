import { queryDnPropValue } from '../utils/dnprop';

export async function checkDnPassword(dn: string, password: string) {
  const dbPw = await queryDnPropValue(dn, 'SERVICES_ACCESS_PASSWORD');
  return dbPw ? password === dbPw : false;
}

export async function checkDnReporterAccess(dn: string) {
  const reporterAccess = await queryDnPropValue(dn, 'REPORTER_ACCESS');
  return reporterAccess === '1';
}