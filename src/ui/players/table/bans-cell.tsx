import React from 'react';
import type { CellProps } from 'csdm/ui/components/table/table-types';
import { BansCell as CommonBansCell } from 'csdm/ui/components/table/cells/bans-cell';
import type { PlayerTable } from 'csdm/common/types/player-table';

type Props = CellProps<PlayerTable>;

export function BansCell({ data: player }: Props) {
  return (
    <CommonBansCell
      showVacBanned={player.isVacBanned}
      showGameBanned={player.isGameBanned}
      showCommunityBanned={player.isCommunityBanned}
    />
  );
}
