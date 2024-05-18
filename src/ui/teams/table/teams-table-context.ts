import { createContext } from 'react';
import type { TableInstance } from 'csdm/ui/components/table/table-types';
import type { TeamTable } from 'csdm/common/types/team-table';

export const TeamsTableContext = createContext<TableInstance<TeamTable> | null>(null);
