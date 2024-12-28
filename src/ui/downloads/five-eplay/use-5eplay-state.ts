import { useDownloadsState } from 'csdm/ui/downloads/use-downloads-state';

export function use5EPlayState() {
  const state = useDownloadsState();

  return state['5eplay'];
}
