import { useSelector } from 'csdm/ui/store/use-selector';

export function useUnsafeCurrentMatch() {
  const match = useSelector((state) => state.match.entity);

  return match;
}
