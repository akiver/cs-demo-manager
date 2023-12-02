import { combineReducers } from '@reduxjs/toolkit';
import { grenadesFinderReducer } from './finder/grenades-finder-reducer';

export const grenadesReducer = combineReducers({
  finder: grenadesFinderReducer,
});
