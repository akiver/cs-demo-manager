import React, { useRef } from 'react';
import { Trans } from '@lingui/macro';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';
import { useSequenceForm } from './use-sequence-form';

export function FocusCameraPlayerSelect() {
  const { sequence, updateSequence } = useSequenceForm();
  const match = useCurrentMatch();
  const options: SelectOption[] = match.players
    .toSorted((playerA, playerB) => {
      return playerA.name.localeCompare(playerB.name);
    })
    .map((player) => {
      return {
        value: player.steamId,
        label: player.name,
      };
    });
  const lastSelectedSteamId = useRef<string | undefined>(sequence.playerFocusSteamId);
  const isChecked = sequence.playerFocusSteamId !== undefined;
  const isDisabled = options.length === 0 || sequence.playerFocusSteamId === undefined;

  return (
    <div className="flex flex-col gap-y-12">
      <div className="flex flex-col gap-y-8">
        <div className="flex gap-x-8">
          <Checkbox
            id="focus-player"
            isChecked={isChecked}
            onChange={(event) => {
              let newSelectedSteamId: string | undefined = undefined;
              if (event.target.checked) {
                if (lastSelectedSteamId.current) {
                  newSelectedSteamId = lastSelectedSteamId.current;
                } else {
                  newSelectedSteamId = options.length > 0 ? options[0].value : undefined;
                }
              }
              updateSequence({
                playerFocusSteamId: newSelectedSteamId,
              });
              lastSelectedSteamId.current = sequence.playerFocusSteamId;
            }}
          />
          <InputLabel htmlFor="focus-player">
            <Trans context="Input label">Focus camera on player</Trans>
          </InputLabel>
        </div>
        <div>
          <Select
            options={options}
            isDisabled={isDisabled}
            value={sequence.playerFocusSteamId}
            onChange={(steamId: string) => {
              updateSequence({
                playerFocusSteamId: steamId,
              });
              lastSelectedSteamId.current = steamId;
            }}
          />
        </div>
      </div>
    </div>
  );
}
