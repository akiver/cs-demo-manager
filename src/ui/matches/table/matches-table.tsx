import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Message } from 'csdm/ui/components/message';
import { Status } from 'csdm/common/types/status';
import { useMatchesStatus } from '../use-matches-status';
import { Table } from 'csdm/ui/components/table/table';
import { useMatchesTable } from './use-matches-table';
import { NoMatches } from './no-matches';

export function MatchesTable() {
  const table = useMatchesTable();
  const status = useMatchesStatus();
  const isLoading = status === Status.Idle || status === Status.Loading || !table.isReady();

  if (isLoading) {
    return <Message message={<Trans>Loading matches…</Trans>} />;
  }

  if (status === Status.Error) {
    return <Message message={<Trans>An error occurred.</Trans>} />;
  }

  if (table.getRowCount() === 0) {
    return <NoMatches />;
  }

  return <Table table={table} />;
}
