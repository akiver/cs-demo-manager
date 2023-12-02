import { createContext } from 'react';
import type { MatchTable } from 'csdm/common/types/match-table';
import type { TableInstance } from 'csdm/ui/components/table/table-types';

export const MatchesTableContext = createContext<TableInstance<MatchTable> | null>(null);
