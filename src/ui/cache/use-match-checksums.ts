import { useCache } from './use-cache';

export function useMatchChecksums() {
  const cache = useCache();

  return cache.matchChecksums;
}
