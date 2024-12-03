import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Message } from 'csdm/ui/components/message';
import { Table } from 'csdm/ui/components/table/table';
import { Status } from 'csdm/common/types/status';
import { useTeamsStatus } from './use-teams-status';
import { NoTeams } from './no-teams';
import { TeamsTableStatusBar } from './table/teams-table-status-bar';
import { useTeamsTable } from './table/use-teams-table';
import type { TeamTable } from 'csdm/common/types/team-table';

export function TeamsTable() {
  const status = useTeamsStatus();
  const table = useTeamsTable();

  if (status === Status.Loading || !table.isReady()) {
    return <Message message={<Trans>Loading teams…</Trans>} />;
  }

  if (status === Status.Error) {
    return <Message message={<Trans>An error occurred.</Trans>} />;
  }

  if (table.getRowCount() === 0) {
    return <NoTeams />;
  }

  return (
    <>
      <Table<TeamTable> table={table} />
      <TeamsTableStatusBar />
    </>
  );
}
