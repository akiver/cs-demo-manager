import { createContext, useContext } from 'react';
import type { MatchesFocus } from './matches-focus';

export const MatchesFocusContext = createContext<MatchesFocus | null>(null);

export function useMatchesFocus() {
  const focus = useContext(MatchesFocusContext);
  if (focus === null) {
    throw new Error('useMatchesFocus must be used within a MatchesFocusContext provider');
  }

  return focus;
}
