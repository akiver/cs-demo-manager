import React from 'react';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';
import type { CellProps } from 'csdm/ui/components/table/table-types';
import type { DeathNoticesPlayerOptions } from 'csdm/common/types/death-notice-player-options';
import { useDeathNotices } from './use-death-notices';

type Props = CellProps<DeathNoticesPlayerOptions>;

export function HighlightPlayerKillsCheckbox({ rowIndex }: Props) {
  const { deathNotices, updateDeathNotices } = useDeathNotices();
  const isChecked = deathNotices[rowIndex].highlightKill;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;

    updateDeathNotices(
      deathNotices.map((deathNotice, index) => {
        if (index === rowIndex) {
          return {
            ...deathNotice,
            highlightKill: isChecked,
          };
        }
        return deathNotice;
      }),
    );
  };

  return <Checkbox onChange={onChange} isChecked={isChecked} />;
}
