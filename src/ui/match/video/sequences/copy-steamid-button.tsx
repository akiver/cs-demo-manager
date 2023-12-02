import React from 'react';
import type { DeathNoticesPlayerOptions } from 'csdm/common/types/death-notice-player-options';
import { CopySteamIdButton as BaseCopySteamIdButton } from 'csdm/ui/components/buttons/copy-steamid-button';
import type { CellProps } from 'csdm/ui/components/table/table-types';

type Props = CellProps<DeathNoticesPlayerOptions>;

export function CopySteamIdButton({ data }: Props) {
  return <BaseCopySteamIdButton steamId={data.steamId} />;
}
