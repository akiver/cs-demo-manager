import { useContext } from 'react';
import { SequencePlayersOptionsContext } from './players-options-provider';

export function usePlayersOptions() {
  return useContext(SequencePlayersOptionsContext);
}
