import { createAction } from '@reduxjs/toolkit';
import type { DemoSource, DemoType } from 'csdm/common/types/counter-strike';
import type { Demo } from 'csdm/common/types/demo';

export const fetchDemosStart = createAction('demos/fetchStart');
export const fetchDemosProgress = createAction<{ demoLoadedCount: number; demoToLoadCount: number }>(
  'demos/fetchProgress',
);
export const fetchDemosError = createAction('demos/fetchError');
export const fetchDemosSuccess = createAction<Demo[]>('demos/fetchSuccess');
export const deleteDemosSuccess = createAction<string[]>('demos/deleteSuccess');
export const demosSourceUpdated = createAction<{ checksums: string[]; source: DemoSource }>('demos/sourceUpdated');
export const demosTypeUpdated = createAction<{ checksums: string[]; type: DemoType }>('demos/typeUpdated');
export const selectionChanged = createAction<{ demosPath: string[] }>('demos/selectionChanged');
export const fuzzySearchTextChanged = createAction<{ text: string }>('demos/fuzzySearchTextChanged');
export const demoRenamed = createAction<{ checksum: string; name: string }>('demos/renamed');
export const demosDeleted = createAction<{ checksums: string[] }>('demos/deleted');
