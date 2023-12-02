import React from 'react';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';
import type { CellProps } from 'csdm/ui/components/table/table-types';
import type { DeathNoticesPlayerOptions } from 'csdm/common/types/death-notice-player-options';
import { useSequenceForm } from './use-sequence-form';

type Props = CellProps<DeathNoticesPlayerOptions>;

export function ShowPlayerKillsCheckbox({ rowIndex }: Props) {
  const { sequence, updateSequence } = useSequenceForm();
  const isChecked = sequence.deathNotices[rowIndex].showKill;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    updateSequence({
      deathNotices: sequence.deathNotices.map((deathNotice, index) => {
        if (index === rowIndex) {
          return {
            ...deathNotice,
            showKill: isChecked,
          };
        }
        return deathNotice;
      }),
    });
  };

  return <Checkbox onChange={onChange} isChecked={isChecked} />;
}
