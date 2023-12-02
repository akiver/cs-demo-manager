import { useSelector } from 'csdm/ui/store/use-selector';

export function useGrenadesState() {
  const state = useSelector((state) => state.match.grenades);

  return state;
}
