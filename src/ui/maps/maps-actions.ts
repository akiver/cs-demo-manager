import { createAction } from '@reduxjs/toolkit';
import type { Map } from 'csdm/common/types/map';

export const addMapSuccess = createAction<{ map: Map }>('maps/addSuccess');
export const deleteMapSuccess = createAction<{ mapId: string }>('maps/deleteSuccess');
export const updateMapSuccess = createAction<{ map: Map }>('maps/updateSuccess');
export const resetMaps = createAction<{ maps: Map[] }>('maps/resetMaps');
