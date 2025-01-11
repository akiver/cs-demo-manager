import React from 'react';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';
import type { CellProps } from 'csdm/ui/components/table/table-types';
import type { SequencePlayerOptions } from 'csdm/common/types/sequence-player-options';
import { usePlayersOptions } from './use-players-options';

type Props = CellProps<SequencePlayerOptions>;

export function HighlightPlayerKillsCheckbox({ rowIndex }: Props) {
  const { options, update } = usePlayersOptions();
  const isChecked = options[rowIndex].highlightKill;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;

    update(
      options.map((options, index) => {
        if (index === rowIndex) {
          return {
            ...options,
            highlightKill: isChecked,
          };
        }
        return options;
      }),
    );
  };

  return <Checkbox onChange={onChange} isChecked={isChecked} />;
}
