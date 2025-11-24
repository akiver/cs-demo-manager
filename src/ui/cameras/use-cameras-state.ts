import { useSelector } from 'csdm/ui/store/use-selector';

export function useCamerasState() {
  const state = useSelector((state) => state.cameras);

  return state;
}
