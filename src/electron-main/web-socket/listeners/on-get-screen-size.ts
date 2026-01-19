import type { Size } from 'csdm/common/types/size';
import { screen } from 'electron/main';

export function onGetScreenSize(): Size {
  return screen.getPrimaryDisplay().size;
}
