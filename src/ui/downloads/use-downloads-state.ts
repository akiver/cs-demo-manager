import { useSelector } from 'csdm/ui/store/use-selector';

export function useDownloadsState() {
  const state = useSelector((state) => state.downloads);

  return state;
}
