import React from 'react';
import type { SequencePlayerOptions } from 'csdm/common/types/sequence-player-options';
import { CopySteamIdButton as BaseCopySteamIdButton } from 'csdm/ui/components/buttons/copy-steamid-button';
import type { CellProps } from 'csdm/ui/components/table/table-types';

type Props = CellProps<SequencePlayerOptions>;

export function CopySteamIdButton({ data }: Props) {
  return <BaseCopySteamIdButton steamId={data.steamId} />;
}
