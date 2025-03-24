import React from 'react';
import { AvatarCell } from 'csdm/ui/components/table/cells/avatar-cell';
import type { CellProps } from 'csdm/ui/components/table/table-types';
import type { PlayerColor } from 'csdm/common/types/counter-strike';

type Props = CellProps<{ name: string; avatar: string | null; color?: PlayerColor }>;

export function ScoreboardAvatarCell({ data: player }: Props) {
  return <AvatarCell playerColor={player.color} avatarUrl={player.avatar} playerName={player.name} />;
}
