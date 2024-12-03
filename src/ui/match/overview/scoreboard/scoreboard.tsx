import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { Player } from 'csdm/common/types/player';
import { TeamScore } from 'csdm/ui/components/match/team-score';
import type { TableInstance } from 'csdm/ui/components/table/table-types';
import { Table } from 'csdm/ui/components/table/table';
import { Message } from 'csdm/ui/components/message';

type Props = {
  teamName: string;
  score: number;
  scoreOppositeTeam: number;
  table: TableInstance<Player>;
};

export function Scoreboard({ table, teamName, score, scoreOppositeTeam }: Props) {
  return (
    <>
      <TeamScore teamName={teamName} teamScore={score} scoreOppositeTeam={scoreOppositeTeam} />
      {table.isReady() ? (
        <div>
          <Table<Player> table={table} />
        </div>
      ) : (
        <Message message={<Trans>Loading…</Trans>} />
      )}
    </>
  );
}
