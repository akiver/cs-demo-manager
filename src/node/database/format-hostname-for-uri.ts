import { isIPv6 } from 'node:net';

export function formatHostnameForUri(hostname: string): string {
  if (isIPv6(hostname) && !hostname.startsWith('[')) {
    return `[${hostname}]`;
  }

  return hostname;
}
