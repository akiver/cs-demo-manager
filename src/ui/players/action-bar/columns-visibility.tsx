import React from 'react';
import { ColumnsVisibilityDropdown } from 'csdm/ui/components/table/columns-visibility-dropdown';
import { Status } from 'csdm/common/types/status';
import { usePlayersStatus } from '../use-players-status';
import { usePlayersTable } from '../table/use-players-table';

export function PlayersColumnsVisibility() {
  const table = usePlayersTable();
  const status = usePlayersStatus();
  const isDisabled = status !== Status.Success;

  return <ColumnsVisibilityDropdown table={table} isDisabled={isDisabled} />;
}
