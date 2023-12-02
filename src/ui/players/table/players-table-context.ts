import { createContext } from 'react';
import type { PlayerTable } from 'csdm/common/types/player-table';
import type { TableInstance } from 'csdm/ui/components/table/table-types';

export const PlayersTableContext = createContext<TableInstance<PlayerTable> | null>(null);
