import React from 'react';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';
import type { CellProps } from 'csdm/ui/components/table/table-types';
import type { SequencePlayerOptions } from 'csdm/common/types/sequence-player-options';
import { useSequenceForm } from './use-sequence-form';

type Props = CellProps<SequencePlayerOptions>;

export function ShowPlayerKillsCheckbox({ rowIndex }: Props) {
  const { sequence, updateSequence } = useSequenceForm();
  const isChecked = sequence.playersOptions[rowIndex].showKill;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    updateSequence({
      playersOptions: sequence.playersOptions.map((options, index) => {
        if (index === rowIndex) {
          return {
            ...options,
            showKill: isChecked,
          };
        }
        return options;
      }),
    });
  };

  return <Checkbox onChange={onChange} isChecked={isChecked} />;
}
