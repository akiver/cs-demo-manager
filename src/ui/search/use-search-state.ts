import { useSelector } from 'csdm/ui/store/use-selector';

export function useSearchState() {
  const state = useSelector((state) => state.search);

  return state;
}
