import { createContext } from 'react';
import type { TableInstance } from 'csdm/ui/components/table/table-types';
import type { Player } from 'csdm/common/types/player';

export const MatchOverviewContext = createContext<{
  tableTeamA: TableInstance<Player> | null;
  tableTeamB: TableInstance<Player> | null;
}>({ tableTeamA: null, tableTeamB: null });
