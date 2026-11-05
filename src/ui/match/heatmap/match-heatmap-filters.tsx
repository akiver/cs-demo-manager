import React from 'react';
import { ExportHeatmapButton } from 'csdm/ui/components/heatmap/export-heatmap-button';
import { HeatmapInputRadius } from 'csdm/ui/components/heatmap/input-radius';
import { HeatmapInputBlur } from 'csdm/ui/components/heatmap/input-blur';
import { HeatmapSideSelect } from 'csdm/ui/components/heatmap/heatmap-side-select';
import { HeatmapInputOpacity } from 'csdm/ui/components/heatmap/heatmap-input-opacity';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { blurChanged, opacityChanged, radiusChanged, timeRangeChanged } from './match-heatmap-actions';
import { HeatmapSelectEvent } from 'csdm/ui/components/heatmap/heatmap-select-event';
import { useHeatmapState } from './use-heatmap-state';
import { useHeatmapContext } from 'csdm/ui/components/heatmap/heatmap-context';
import { RadarLevelSelect } from 'csdm/ui/components/inputs/select/radar-level-select';
import { RoundsSelect } from 'csdm/ui/components/inputs/select/rounds-select';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import type { MatchHeatmapFilter } from 'csdm/common/types/heatmap-filters';
import { TeamsSelect } from 'csdm/ui/components/inputs/select/teams-select';
import { PlayersSelect } from 'csdm/ui/components/inputs/select/players-select';
import { HeatmapFilters } from 'csdm/ui/components/heatmap/heatmap-filters';
import { ResetZoomButton } from 'csdm/ui/components/heatmap/reset-zoom-button';
import { HeatmapTimeRangeSlider } from 'csdm/ui/components/heatmap/heatmap-time-range-slider';
import { HeatmapPlantPhaseSelect } from 'csdm/ui/components/heatmap/heatmap-plant-phase-select';

export function MatchHeatmapFilters() {
  const dispatch = useDispatch();
  const match = useCurrentMatch();
  const { event, radarLevel, rounds, sides, teamNames, steamIds, timeRange, plantPhase } = useHeatmapState();
  const { mapName, game, fetchPoints } = useHeatmapContext<Partial<MatchHeatmapFilter>>();

  const selectedRounds =
    rounds.length > 0 ? match.rounds.filter((round) => rounds.includes(round.number)) : match.rounds;
  const maxRoundDurationSeconds = Math.max(
    0,
    ...selectedRounds.map((round) => (round.endTick - round.freezetimeEndTick) / match.tickrate),
  );
  // The bomb plant mark is relevant only when a single round is selected
  let bombPlantSeconds: number | null = null;
  if (selectedRounds.length === 1) {
    const [round] = selectedRounds;
    const bombPlanted = match.bombsPlanted.find((bombPlanted) => bombPlanted.roundNumber === round.number);
    if (bombPlanted !== undefined) {
      bombPlantSeconds = (bombPlanted.tick - round.freezetimeEndTick) / match.tickrate;
    }
  }

  return (
    <HeatmapFilters>
      <HeatmapInputRadius
        onChange={(radius) => {
          dispatch(radiusChanged(radius));
        }}
      />
      <HeatmapInputBlur
        onChange={(blur) => {
          dispatch(blurChanged(blur));
        }}
      />
      <HeatmapInputOpacity
        onChange={(opacity) => {
          dispatch(opacityChanged(opacity));
        }}
      />
      <HeatmapSelectEvent
        event={event}
        onChange={async (event) => {
          await fetchPoints({ event });
        }}
      />
      <RadarLevelSelect
        mapName={mapName}
        game={game}
        onChange={async (radarLevel) => {
          await fetchPoints({ radarLevel });
        }}
        selectedRadarLevel={radarLevel}
      />
      <RoundsSelect
        onChange={async (rounds) => {
          await fetchPoints({ rounds });
        }}
        rounds={match.rounds}
        selectedRoundNumbers={rounds}
      />
      <HeatmapTimeRangeSlider
        timeRange={timeRange}
        maxSeconds={maxRoundDurationSeconds}
        bombPlantSeconds={bombPlantSeconds}
        onChange={async (timeRange) => {
          dispatch(timeRangeChanged(timeRange));
          await fetchPoints({ timeRange });
        }}
      />
      {match.bombsPlanted.length > 0 && (
        <HeatmapPlantPhaseSelect
          plantPhase={plantPhase}
          onChange={async (plantPhase) => {
            await fetchPoints({ plantPhase });
          }}
        />
      )}
      <HeatmapSideSelect
        sides={sides}
        onChange={async (sides) => {
          await fetchPoints({ sides });
        }}
      />
      <TeamsSelect
        teamNameA={match.teamA.name}
        teamNameB={match.teamB.name}
        selectedTeamNames={teamNames}
        onChange={async (teamName: string | undefined) => {
          await fetchPoints({ teamNames: teamName ? [teamName] : [] });
        }}
      />
      <PlayersSelect
        players={match.players}
        selectedSteamIds={steamIds}
        onChange={async (steamIds: string[]) => {
          await fetchPoints({ steamIds });
        }}
      />
      <div className="flex flex-wrap gap-x-8">
        <ResetZoomButton />
        <ExportHeatmapButton />
      </div>
    </HeatmapFilters>
  );
}
