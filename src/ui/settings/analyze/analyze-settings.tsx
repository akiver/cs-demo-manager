import React from 'react';
import { ToggleAnalyzePositions } from './toggle-analyze-positions';
import { MaxConcurrentAnalysesSelect } from './max-concurrent-analyses-select';

export function AnalyzeSettings() {
  return (
    <>
      <MaxConcurrentAnalysesSelect />
      <ToggleAnalyzePositions />
    </>
  );
}
