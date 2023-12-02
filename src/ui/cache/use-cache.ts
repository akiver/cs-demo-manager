import { useSelector } from 'csdm/ui/store/use-selector';

export function useCache() {
  const cache = useSelector((state) => state.cache);

  return cache;
}
