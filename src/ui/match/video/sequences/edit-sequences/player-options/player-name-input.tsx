import React, { useState } from 'react';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import type { SequencePlayerOptions } from 'csdm/common/types/sequence-player-options';
import type { CellProps } from 'csdm/ui/components/table/table-types';
import { usePlayersOptions } from './use-players-options';

type Props = CellProps<SequencePlayerOptions>;

export function PlayerNameInput({ rowIndex }: Props) {
  const { options, update } = usePlayersOptions();
  const [playerName, setPlayerName] = useState(options[rowIndex].playerName);
  // Player's name edition is available only on Windows
  const isDisabled = !window.csdm.isWindows;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPlayerName(value);
  };

  const onBlur = () => {
    update(
      options.map((options, index) => {
        if (index === rowIndex) {
          return {
            ...options,
            playerName,
          };
        }
        return options;
      }),
    );
  };

  return <TextInput onChange={onChange} onBlur={onBlur} value={playerName} isDisabled={isDisabled} />;
}
