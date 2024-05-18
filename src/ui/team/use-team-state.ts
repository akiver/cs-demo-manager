import { useSelector } from 'csdm/ui/store/use-selector';

export function useTeamState() {
  const state = useSelector((state) => state.team);

  return state;
}
