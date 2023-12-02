import { createAction } from '@reduxjs/toolkit';
import type { GrenadeName, TeamNumber } from 'csdm/common/types/counter-strike';
import type { RadarLevel } from 'csdm/ui/maps/radar-level';

export const playersChanged = createAction<{ steamIds: string[] }>('match/grenades/finder/playersChanged');
export const roundsChanged = createAction<{ rounds: number[] }>('match/grenades/finder/roundsChanged');
export const grenadeNameChanged = createAction<{ grenadeName: GrenadeName }>(
  'match/grenades/finder/grenadeNameChanged',
);
export const sidesChanged = createAction<{ sides: TeamNumber[] }>('match/grenades/finder/sidesChanged');
export const radarLevelChanged = createAction<{ radarLevel: RadarLevel }>('match/grenades/finder/radarLevelChanged');
