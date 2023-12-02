import { useSettings } from '../use-settings';

export function useFolders() {
  const settings = useSettings();

  return settings.folders;
}
