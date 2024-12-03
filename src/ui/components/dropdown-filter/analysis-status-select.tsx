import React from 'react';
import { Trans } from '@lingui/react/macro';
import { AnalysisStatusFilter } from 'csdm/common/types/analysis-status-filter';
import { Select, type SelectOption } from 'csdm/ui/components/inputs/select';
import { ActiveFilterIndicator } from './active-filter-indicator';

type Props = {
  selectedStatus: AnalysisStatusFilter | undefined;
  onChange: (status: AnalysisStatusFilter) => void;
};

export function AnalysisStatusSelect({ selectedStatus, onChange }: Props) {
  const options: SelectOption<AnalysisStatusFilter>[] = [
    {
      value: AnalysisStatusFilter.All,
      label: <Trans context="Option label for demo analysis status">All</Trans>,
    },
    {
      value: AnalysisStatusFilter.NotInDatabase,
      label: <Trans context="Option label for demo analysis status">Not in database</Trans>,
    },
    {
      value: AnalysisStatusFilter.Pending,
      label: <Trans context="Option label for demo analysis status">Pending</Trans>,
    },
    {
      value: AnalysisStatusFilter.InProgress,
      label: <Trans context="Option label for demo analysis status">In progress</Trans>,
    },
    {
      value: AnalysisStatusFilter.InDatabase,
      label: <Trans context="Option label for demo analysis status">In database</Trans>,
    },
    {
      value: AnalysisStatusFilter.Error,
      label: <Trans context="Option label for demo analysis status">Error</Trans>,
    },
  ];

  const hasActiveFilter = selectedStatus !== AnalysisStatusFilter.All;

  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex items-center justify-between">
        <p>
          <Trans context="Demo analysis status">Status</Trans>
        </p>
        {hasActiveFilter && <ActiveFilterIndicator />}
      </div>
      <div>
        <Select options={options} value={selectedStatus} onChange={onChange} />
      </div>
    </div>
  );
}
