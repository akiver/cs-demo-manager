import type { ReactElement } from 'react';
import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { Demo } from 'csdm/common/types/demo';
import type { CellProps } from 'csdm/ui/components/table/table-types';
import { Spinner } from 'csdm/ui/components/spinner';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { AnalysisStatus } from 'csdm/common/types/analysis-status';
import { TimesCircleIcon } from 'csdm/ui/icons/times-circle';
import { useGetDemoAnalysisStatus } from 'csdm/ui/analyses/use-get-demo-analysis-status';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';
import { CheckCircleIcon } from 'csdm/ui/icons/check-circle-icon';
import { ClockIcon } from 'csdm/ui/icons/clock-icon';

function getAnalysisStatusTooltipText(status: AnalysisStatus | undefined) {
  switch (status) {
    case AnalysisStatus.Pending:
      return <Trans>Pending analysis…</Trans>;
    case AnalysisStatus.Analyzing:
      return <Trans>Analyzing…</Trans>;
    case AnalysisStatus.AnalyzeError:
      return <Trans>Analyze error</Trans>;
    case AnalysisStatus.InsertError:
      return <Trans>Insertion error</Trans>;
    case AnalysisStatus.AnalyzeSuccess:
    case AnalysisStatus.Inserting:
      return <Trans>Inserting into database…</Trans>;
    case AnalysisStatus.InsertSuccess:
      return <Trans>In database</Trans>;
    default:
      return <Trans>Not in database</Trans>;
  }
}

type Props = CellProps<Demo>;

export function DemoStatusCell({ data: demo }: Props) {
  const getDemoAnalysisStatus = useGetDemoAnalysisStatus();
  const status = getDemoAnalysisStatus(demo.checksum);
  const tooltipText = getAnalysisStatusTooltipText(status);

  let icon: ReactElement;
  switch (status) {
    case AnalysisStatus.Pending:
      icon = <ClockIcon className="fill-blue-700" />;
      break;
    case AnalysisStatus.AnalyzeError:
    case AnalysisStatus.InsertError:
      icon = <ExclamationTriangleIcon className="fill-red-400" />;
      break;
    case AnalysisStatus.InsertSuccess:
      icon = <CheckCircleIcon className="fill-green-400" />;
      break;
    case AnalysisStatus.Inserting:
    case AnalysisStatus.Analyzing:
    case AnalysisStatus.AnalyzeSuccess:
      icon = <Spinner size={18} />;
      break;
    default:
      icon = <TimesCircleIcon className="fill-orange-400" />;
  }

  return (
    <Tooltip content={tooltipText}>
      <div>{icon}</div>
    </Tooltip>
  );
}
