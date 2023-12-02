import type { DemoSource, DemoType, Game } from 'csdm/common/types/counter-strike';
import type { AnalysisStatusFilter } from 'csdm/common/types/analysis-status-filter';

export type DemosTableFilter = {
  sources: DemoSource[];
  types: DemoType[];
  games: Game[];
  tagIds: string[];
  startDate: string | undefined;
  endDate: string | undefined;
  analysisStatus: AnalysisStatusFilter;
};
