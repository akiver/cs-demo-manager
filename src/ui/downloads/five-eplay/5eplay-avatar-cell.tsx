import React from 'react';
import { AvatarCell } from 'csdm/ui/components/table/cells/avatar-cell';
import type { CellProps } from 'csdm/ui/components/table/table-types';
import type { FiveEPlayPlayer } from 'csdm/common/types/5eplay-match';

type Props = CellProps<FiveEPlayPlayer>;

export function FiveEPlayAvatarCell({ data: player }: Props) {
  return <AvatarCell avatarUrl={player.avatarUrl} playerName={player.name} />;
}
