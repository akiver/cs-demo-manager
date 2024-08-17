import React, { useState } from 'react';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import type { DeathNoticesPlayerOptions } from 'csdm/common/types/death-notice-player-options';
import type { CellProps } from 'csdm/ui/components/table/table-types';
import { useDeathNotices } from './use-death-notices';
import { Game } from 'csdm/common/types/counter-strike';

type Props = CellProps<DeathNoticesPlayerOptions>;

export function PlayerNameInput({ rowIndex }: Props) {
  const { deathNotices, updateDeathNotices, game } = useDeathNotices();
  const [playerName, setPlayerName] = useState(deathNotices[rowIndex].playerName);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPlayerName(value);
  };

  const onBlur = () => {
    updateDeathNotices(
      deathNotices.map((deathNotice, index) => {
        if (index === rowIndex) {
          return {
            ...deathNotice,
            playerName,
          };
        }
        return deathNotice;
      }),
    );
  };

  // HLAE does not support player name editing for CS2 yet
  return <TextInput isDisabled={game !== Game.CSGO} onChange={onChange} onBlur={onBlur} value={playerName} />;
}
