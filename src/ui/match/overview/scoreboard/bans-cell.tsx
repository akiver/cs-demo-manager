import React from 'react';
import type { CellProps } from 'csdm/ui/components/table/table-types';
import { BansCell as CommonBansCell } from 'csdm/ui/components/table/cells/bans-cell';
import type { Player } from 'csdm/common/types/player';

type Props = CellProps<Player>;

export function BansCell({ data: match }: Props) {
  return (
    <CommonBansCell showVacBanned={match.lastBanDate !== null} showGameBanned={false} showCommunityBanned={false} />
  );
}
