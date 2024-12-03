import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { Analysis } from 'csdm/common/types/analysis';
import { AnalysisStatus } from 'csdm/common/types/analysis-status';

type Props = {
  data: Analysis;
};

export function StatusCell({ data }: Props) {
  const { status } = data;

  switch (status) {
    case AnalysisStatus.Analyzing:
      return <Trans context="Analysis status">Analyzing</Trans>;
    case AnalysisStatus.AnalyzeError:
    case AnalysisStatus.InsertError:
      return <Trans context="Analysis status">Error</Trans>;
    case AnalysisStatus.AnalyzeSuccess:
    case AnalysisStatus.Inserting:
      return <Trans context="Analysis status">Inserting</Trans>;
    case AnalysisStatus.InsertSuccess:
      return <Trans context="Analysis status">Done</Trans>;
    default:
      return <Trans context="Analysis status">Pending</Trans>;
  }
}
