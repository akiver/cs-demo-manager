import React from 'react';
import type { CellProps } from 'csdm/ui/components/table/table-types';
import { BansCell as CommonBansCell } from 'csdm/ui/components/table/cells/bans-cell';

type Props = CellProps<{ lastBanDate: string | null }>;

export function BansCell({ data: { lastBanDate } }: Props) {
  return <CommonBansCell showVacBanned={lastBanDate !== null} showGameBanned={false} showCommunityBanned={false} />;
}
