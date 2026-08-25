import { createAction } from '@reduxjs/toolkit';
import type { Demo } from 'csdm/common/types/demo';
import type { ValvePlayer } from 'csdm/common/types/valve-match';
import type { ErrorCode } from 'csdm/common/error-code';

export const loadDemoStart = createAction('demo/loadStart');
export const loadDemoSuccess = createAction<Demo>('demo/loadSuccess');
export const loadDemoError = createAction<{ errorCode: ErrorCode }>('demo/loadError');
export const selectPlayer = createAction<ValvePlayer>('demo/selectPlayer');
