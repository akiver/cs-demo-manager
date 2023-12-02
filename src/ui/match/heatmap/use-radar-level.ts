import { useHeatmapState } from 'csdm/ui/match/heatmap/use-heatmap-state';
import type { RadarLevel } from 'csdm/ui/maps/radar-level';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { radarLevelChanged } from './heatmap-actions';

export function useRadarLevel() {
  const { radarLevel } = useHeatmapState();
  const dispatch = useDispatch();

  return {
    radarLevel,
    updateRadarLevel: (radarLevel: RadarLevel) => {
      dispatch(radarLevelChanged({ radarLevel }));
    },
  };
}
