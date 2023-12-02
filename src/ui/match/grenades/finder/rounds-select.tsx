import React from 'react';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { RoundsSelect } from 'csdm/ui/components/inputs/select/rounds-select';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { roundsChanged } from './grenades-finder-actions';
import { useSelectedRounds } from './use-selected-rounds';

export function FinderRoundsSelect() {
  const match = useCurrentMatch();
  const selectedRounds = useSelectedRounds();
  const dispatch = useDispatch();

  return (
    <RoundsSelect
      rounds={match.rounds}
      selectedRoundNumbers={selectedRounds}
      onChange={(rounds: number[]) => {
        dispatch(roundsChanged({ rounds }));
      }}
    />
  );
}
