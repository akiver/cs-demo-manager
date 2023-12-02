import React from 'react';
import { AvatarCell } from 'csdm/ui/components/table/cells/avatar-cell';
import type { CellProps } from 'csdm/ui/components/table/table-types';
import type { Player } from 'csdm/common/types/player';

type Props = CellProps<Player>;

export function ScoreboardAvatarCell({ data: player }: Props) {
  return <AvatarCell playerColor={player.color} avatarUrl={player.avatar} playerName={player.name} />;
}
