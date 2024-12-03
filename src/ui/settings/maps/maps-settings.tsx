import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { Game } from 'csdm/common/types/counter-strike';
import { SettingsView } from 'csdm/ui/settings/settings-view';
import { Maps } from 'csdm/ui/settings/maps/maps';
import { AddMapButton } from './add-map-button';
import { ResetDefaultMapsButton } from './reset-default-maps-button';
import { Select } from 'csdm/ui/components/inputs/select';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { useGameOptions } from 'csdm/ui/hooks/use-game-options';

export function MapsSettings() {
  const [game, setGame] = useState<Game>(Game.CS2);
  const gameOptions = useGameOptions({ includeCs2LimitedTest: false });

  return (
    <SettingsView>
      <div className="flex gap-x-8 items-center mb-12">
        <InputLabel>
          <Trans context="Select label">Game</Trans>
        </InputLabel>
        <Select
          options={gameOptions}
          onChange={(game) => {
            setGame(game);
          }}
        />
      </div>
      <div className="flex gap-x-8 mb-12">
        <AddMapButton game={game} />
        <ResetDefaultMapsButton game={game} />
      </div>
      <Maps game={game} />
    </SettingsView>
  );
}
