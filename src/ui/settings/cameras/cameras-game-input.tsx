import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { Game } from 'csdm/common/types/counter-strike';
import { Select } from 'csdm/ui/components/inputs/select';
import { useGameOptions } from 'csdm/ui/hooks/use-game-options';

type Props = {
  game: Game;
  onChange: (game: Game) => void;
};

export function CamerasGameInput({ game, onChange }: Props) {
  const gameOptions = useGameOptions({ includeCs2LimitedTest: false });

  return (
    <div className="flex items-center gap-x-8">
      <Select
        label={<Trans context="Select label">Game</Trans>}
        options={gameOptions}
        value={game}
        onChange={onChange}
      />
    </div>
  );
}
