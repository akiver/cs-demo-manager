import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { PlayerTable } from 'csdm/common/types/player-table';
import { Message } from 'csdm/ui/components/message';
import { Table } from 'csdm/ui/components/table/table';
import { Status } from 'csdm/common/types/status';
import { usePlayersStatus } from './use-players-status';
import { NoPlayers } from './no-players';
import { PlayersTableStatusBar } from './table/players-table-status-bar';
import { usePlayersTable } from './table/use-players-table';

export function PlayersTable() {
  const status = usePlayersStatus();
  const table = usePlayersTable();

  if (status === Status.Loading || !table.isReady()) {
    return <Message message={<Trans>Loading players…</Trans>} />;
  }

  if (status === Status.Error) {
    return <Message message={<Trans>An error occurred.</Trans>} />;
  }

  if (table.getRowCount() === 0) {
    return <NoPlayers />;
  }

  return (
    <>
      <Table<PlayerTable> table={table} />
      <PlayersTableStatusBar />
    </>
  );
}
