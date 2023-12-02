import React from 'react';
import type { CellProps } from 'csdm/ui/components/table/table-types';
import { BansCell as CommonBansCell } from 'csdm/ui/components/table/cells/bans-cell';
import type { MatchTable } from 'csdm/common/types/match-table';

type Props = CellProps<MatchTable>;

export function BansCell({ data: match }: Props) {
  return (
    <CommonBansCell showVacBanned={match.bannedPlayerCount > 0} showGameBanned={false} showCommunityBanned={false} />
  );
}
