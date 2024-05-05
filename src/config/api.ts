import { isDev } from './node';

export const apiRootDomain = 'shipzen.dev';
export const apiBaseDomain = (() => {
  if (isDev) return 'localhost:3001';
  return `www.${apiRootDomain}`;
})();
export const apiBaseUrl = (() => {
  if (isDev) return `http://${apiBaseDomain}`;
  return `https://${apiBaseDomain}`;
})();
