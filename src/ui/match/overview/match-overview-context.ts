import { createContext } from 'react';
import type { TableInstance } from 'csdm/ui/components/table/table-types';
import type { MatchPlayer } from 'csdm/common/types/match-player';

export const MatchOverviewContext = createContext<{
  tableTeamA: TableInstance<MatchPlayer> | null;
  tableTeamB: TableInstance<MatchPlayer> | null;
}>({ tableTeamA: null, tableTeamB: null });
