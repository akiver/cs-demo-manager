import { useSelector } from 'csdm/ui/store/use-selector';

export function useSettings() {
  const settings = useSelector((state) => state.settings);

  return settings;
}
