// Steps reported while loading the demos table.
// Archives are extracted first so their demos can be discovered, then the demos are loaded.
export const LoadDemosStep = {
  ScanningArchives: 'scanning-archives',
  ExtractingArchives: 'extracting-archives',
  LoadingDemos: 'loading-demos',
} as const;

export type LoadDemosStep = (typeof LoadDemosStep)[keyof typeof LoadDemosStep];

export type LoadDemosProgress = {
  step: LoadDemosStep;
  current: number;
  total: number;
};
