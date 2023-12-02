import type { DemoSource } from 'csdm/common/types/counter-strike';
import type { AnalysisStatus } from './analysis-status';

export type Analysis = {
  demoPath: string;
  demoChecksum: string;
  mapName: string;
  source: DemoSource;
  addedAt: string;
  status: AnalysisStatus;
  output: string;
};
