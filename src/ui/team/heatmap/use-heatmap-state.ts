import { useSelector } from 'csdm/ui/store/use-selector';

export function useHeatmapState() {
  return useSelector((state) => state.team.heatmap);
}
