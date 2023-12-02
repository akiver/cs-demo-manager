import { createContext } from 'react';
import type { Demo } from 'csdm/common/types/demo';
import type { TableInstance } from 'csdm/ui/components/table/table-types';

export const DemosTableContext = createContext<TableInstance<Demo> | null>(null);
