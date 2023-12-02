import React from 'react';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { PlayersSelect } from 'csdm/ui/components/inputs/select/players-select';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { playersChanged } from './grenades-finder-actions';
import { useSelectedSteamIds } from './use-selected-steamids';

export function FinderPlayerSelect() {
  const match = useCurrentMatch();
  const selectedSteamIds = useSelectedSteamIds();
  const dispatch = useDispatch();

  return (
    <PlayersSelect
      players={match.players}
      selectedSteamIds={selectedSteamIds}
      onChange={(steamIds: string[]) => {
        dispatch(playersChanged({ steamIds }));
      }}
    />
  );
}
