import React, { useRef, type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';

type Props = {
  playerFocusSteamId: string | undefined;
  onChange: (playerFocusSteamId: string | undefined) => void;
  label?: ReactNode;
};

export function FocusCameraPlayerSelect({ playerFocusSteamId, onChange, label }: Props) {
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
  const lastSelectedSteamId = useRef<string | undefined>(playerFocusSteamId);
  const isChecked = playerFocusSteamId !== undefined;
  const isDisabled = options.length === 0 || playerFocusSteamId === undefined;

  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex gap-x-8">
        <Checkbox
          label={label ?? <Trans context="Checkbox label">Focus camera on player</Trans>}
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
            onChange(newSelectedSteamId);
            lastSelectedSteamId.current = playerFocusSteamId;
          }}
        />
      </div>
      <div>
        <Select
          options={options}
          isDisabled={isDisabled}
          value={playerFocusSteamId}
          onChange={(steamId: string) => {
            onChange(steamId);
            lastSelectedSteamId.current = steamId;
          }}
        />
      </div>
    </div>
  );
}
