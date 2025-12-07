import React from 'react';
import { AvatarCell } from 'csdm/ui/components/table/cells/avatar-cell';
import type { CellProps } from 'csdm/ui/components/table/table-types';
import type { RenownPlayer } from 'csdm/common/types/renown-match';

type AvatarCellProps = CellProps<RenownPlayer>;

export function RenownAvatarCell({ data: player }: AvatarCellProps) {
  return <AvatarCell avatarUrl={player.avatarUrl} playerName={player.name} />;
}
