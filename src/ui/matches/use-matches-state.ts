import { useSelector } from 'csdm/ui/store/use-selector';

export function useMatchesState() {
  const matchesState = useSelector((state) => state.matches);

  return matchesState;
}
