import React from 'react';
import { ToggleAnalyzePositions } from './toggle-analyze-positions';
import { MaxConcurrentAnalysesSelect } from './max-concurrent-analyses-select';
import { ToggleComputeTimeToDamage } from './toggle-compute-time-to-damage';

export function AnalyzeSettings() {
  return (
    <>
      <MaxConcurrentAnalysesSelect />
      <ToggleAnalyzePositions />
      <ToggleComputeTimeToDamage />
    </>
  );
}
