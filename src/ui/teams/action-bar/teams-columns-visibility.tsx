import React from 'react';
import { ColumnsVisibilityDropdown } from 'csdm/ui/components/table/columns-visibility-dropdown';
import { Status } from 'csdm/common/types/status';
import { useTeamsStatus } from '../use-teams-status';
import { useTeamsTable } from '../table/use-teams-table';

export function TeamsColumnsVisibility() {
  const table = useTeamsTable();
  const status = useTeamsStatus();
  const isDisabled = status !== Status.Success;

  return <ColumnsVisibilityDropdown table={table} isDisabled={isDisabled} />;
}
