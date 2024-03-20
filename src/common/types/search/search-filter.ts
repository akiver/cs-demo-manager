import type { DemoSource } from 'csdm/common/types/counter-strike';

export type SearchFilter = {
  steamIds: string[];
  mapNames: string[];
  startDate: string | undefined;
  endDate: string | undefined;
  demoSources: DemoSource[];
  roundTagIds: string[];
};
