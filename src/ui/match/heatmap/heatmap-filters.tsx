import React from 'react';
import { HeatmapExportButton } from 'csdm/ui/match/heatmap/export-button';
import { HeatmapRoundsSelect } from 'csdm/ui/match/heatmap/rounds-select';
import { HeatmapInputRadius } from 'csdm/ui/match/heatmap/input-radius';
import { HeatmapInputBlur } from 'csdm/ui/match/heatmap/input-blur';
import { HeatmapInputEvent } from 'csdm/ui/match/heatmap/input-event';
import { HeatmapSideSelect } from './input-side-select';
import { HeatmapInputPlayers } from './input-players';
import { HeatmapTeamsSelect } from './heatmap-teams-select';
import { HeatmapRadarLevelSelect } from './radar-level-select';
import { HeatmapInputOpacity } from './input-opacity';

export function HeatmapFilters() {
  return (
    <div className="flex flex-col w-[400px] gap-y-12 mr-16">
      <HeatmapInputRadius />
      <HeatmapInputBlur />
      <HeatmapInputOpacity />
      <HeatmapInputEvent />
      <HeatmapRadarLevelSelect />
      <HeatmapRoundsSelect />
      <HeatmapSideSelect />
      <HeatmapTeamsSelect />
      <HeatmapInputPlayers />
      <HeatmapExportButton />
    </div>
  );
}
