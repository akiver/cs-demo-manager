import { useSelector } from 'csdm/ui/store/use-selector';
import type { MatchHeatmapState } from './heatmap-reducer';

export function useHeatmapState(): MatchHeatmapState {
  return useSelector((state) => state.match.heatmap);
}
