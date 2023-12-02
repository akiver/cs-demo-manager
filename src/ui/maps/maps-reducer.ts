import { createReducer } from '@reduxjs/toolkit';
import { initializeAppSuccess } from 'csdm/ui/bootstrap/bootstrap-actions';
import type { Map } from 'csdm/common/types/map';
import { addMapSuccess, deleteMapSuccess, resetMaps, updateMapSuccess } from './maps-actions';

function sortMapsByName(map1: Map, map2: Map) {
  return map1.name.localeCompare(map2.name);
}

type MapsState = {
  readonly entities: Map[];
  // Used to read images on the FS only if maps have changed (reduce file:// requests).
  readonly cacheTimestamp: number;
};

const initialState: MapsState = {
  entities: [],
  cacheTimestamp: Date.now(),
};

export const mapsReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(addMapSuccess, (state, action) => {
      state.entities.push(action.payload.map);
      state.entities.sort(sortMapsByName);
    })
    .addCase(deleteMapSuccess, (state, action) => {
      state.entities = state.entities.filter((map) => {
        return !action.payload.mapId.includes(map.id);
      });
    })
    .addCase(updateMapSuccess, (state, action) => {
      const mapIndex = state.entities.findIndex((map) => map.id === action.payload.map.id);
      if (mapIndex > -1) {
        state.entities[mapIndex] = action.payload.map;
        state.cacheTimestamp = Date.now();
      }
    })
    .addCase(initializeAppSuccess, (state, action) => {
      state.entities = action.payload.maps.sort(sortMapsByName);
    })
    .addCase(resetMaps, (state, action) => {
      state.entities = action.payload.maps;
    });
});
