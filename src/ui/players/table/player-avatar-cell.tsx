import React from 'react';
import { AvatarCell } from 'csdm/ui/components/table/cells/avatar-cell';
import type { CellProps } from 'csdm/ui/components/table/table-types';
import type { PlayerTable } from 'csdm/common/types/player-table';

type AvatarProps = CellProps<PlayerTable>;

export function PlayerAvatarCell({ data: player }: AvatarProps) {
  return <AvatarCell avatarUrl={player.avatar} playerName={player.name} />;
}
