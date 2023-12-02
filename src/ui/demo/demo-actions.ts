import { createAction } from '@reduxjs/toolkit';
import type { Demo } from 'csdm/common/types/demo';
import type { ValvePlayer } from 'csdm/common/types/valve-match';

export const loadDemoSuccess = createAction<Demo>('demo/loadSuccess');
export const selectPlayer = createAction<ValvePlayer>('demo/selectPlayer');
