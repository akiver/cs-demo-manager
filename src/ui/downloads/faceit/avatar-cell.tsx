import React from 'react';
import { AvatarCell } from 'csdm/ui/components/table/cells/avatar-cell';
import type { CellProps } from 'csdm/ui/components/table/table-types';
import type { FaceitPlayer } from 'csdm/common/types/faceit-match';

type AvatarCellProps = CellProps<FaceitPlayer>;

export function FaceitAvatarCell({ data: player }: AvatarCellProps) {
  return <AvatarCell avatarUrl={player.avatarUrl} playerName={player.name} />;
}
