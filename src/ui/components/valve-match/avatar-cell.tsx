import React from 'react';
import type { ValvePlayer } from 'csdm/common/types/valve-match';
import { AvatarCell } from '../table/cells/avatar-cell';
import type { CellProps } from '../table/table-types';

type Props = CellProps<ValvePlayer>;

export function ValveAvatarCell({ data: player }: Props) {
  return <AvatarCell avatarUrl={player.avatar} playerName={player.name} />;
}
