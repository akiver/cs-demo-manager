import { combineReducers } from '@reduxjs/toolkit';
import { demosReducer } from 'csdm/ui/demos/demos-reducer';
import { analysesReducer } from 'csdm/ui/analyses/analyses-reducer';
import { matchesReducer } from 'csdm/ui/matches/matches-reducer';
import { matchReducer } from 'csdm/ui/match/match-reducer';
import { demoReducer } from 'csdm/ui/demo/demo-reducer';
import { banReducer } from 'csdm/ui/ban/ban-reducer';
import { downloadsReducer } from 'csdm/ui/downloads/downloads-reducer';
import { cacheReducer } from 'csdm/ui/cache/cache-reducer';
import { mapsReducer } from 'csdm/ui/maps/maps-reducer';
import { playersReducer } from '../players/players-reducer';
import { settingsReducer } from '../settings/settings-reducer';
import { bootstrapReducer } from '../bootstrap/bootstrap-reducer';
import { playerReducer } from 'csdm/ui/player/player-reducer';
import { tagsReducer } from 'csdm/ui/tags/tags-reducer';
import { searchReducer } from '../search/search-reducer';
import { teamsReducer } from '../teams/teams-reducer';
import { teamReducer } from '../team/team-reducer';
import { videosReducer } from '../videos/videos-reducer';

export const reducers = combineReducers({
  bootstrap: bootstrapReducer,
  matches: matchesReducer,
  demos: demosReducer,
  maps: mapsReducer,
  analyses: analysesReducer,
  demo: demoReducer,
  match: matchReducer,
  ban: banReducer,
  downloads: downloadsReducer,
  cache: cacheReducer,
  players: playersReducer,
  player: playerReducer,
  teams: teamsReducer,
  team: teamReducer,
  settings: settingsReducer,
  tags: tagsReducer,
  search: searchReducer,
  videos: videosReducer,
});

export type RootState = ReturnType<typeof reducers>;
