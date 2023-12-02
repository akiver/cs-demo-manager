import React from 'react';
import { AnalysesTable } from './table/analyses-table';
import { AnalysisLogs } from './analysis-logs';

export function Analyses() {
  return (
    <>
      <AnalysesTable />
      <AnalysisLogs />
    </>
  );
}
