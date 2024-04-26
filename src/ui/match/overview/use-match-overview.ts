import { useContext } from 'react';
import { MatchOverviewContext } from './match-overview-context';

export function useMatchOverview() {
  const { tableTeamA, tableTeamB } = useContext(MatchOverviewContext);
  if (!tableTeamA || !tableTeamB) {
    throw new Error('useMatchOverview must be used within a MatchOverviewContext.Provider');
  }

  return { tableTeamA, tableTeamB };
}
