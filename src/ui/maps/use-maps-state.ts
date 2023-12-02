import { useSelector } from 'csdm/ui/store/use-selector';

export function useMapsState() {
  const state = useSelector((state) => state.maps);

  return state;
}
