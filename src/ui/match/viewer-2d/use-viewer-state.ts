import { useSelector } from 'csdm/ui/store/use-selector';
import type { Viewer2DState } from './viewer-2d-reducer';

export function useViewer2DState(): Viewer2DState {
  return useSelector((state) => state.match.viewer2D);
}
