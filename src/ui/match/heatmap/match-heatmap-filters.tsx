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
import { HeatmapEvent } from 'csdm/common/types/heatmap-event';
import { TimeRangeSlider } from 'csdm/ui/components/heatmap/time-range-slider';

export function MatchHeatmapFilters() {
  const dispatch = useDispatch();
  const match = useCurrentMatch();
  const { event, radarLevel, rounds, sides, teamNames, steamIds, startSeconds, endSeconds } = useHeatmapState();
  const { mapName, game, fetchPoints } = useHeatmapContext<
    Partial<MatchHeatmapFilter> & { startSeconds?: number; endSeconds?: number }
  >();

  const isPositionsEvent = event === HeatmapEvent.Positions;

  // Compute time-related values for the slider from selected rounds
  // All times are relative to freeze time end (0 = freeze time end)
  const selectedRounds = rounds.length > 0 ? match.rounds.filter((r) => rounds.includes(r.number)) : match.rounds;

  const maxRoundDurationSeconds = selectedRounds.reduce((max, round) => {
    const durationTicks = round.endTick - round.freezetimeEndTick;
    const durationSeconds = durationTicks / match.tickrate;
    return Math.max(max, durationSeconds);
  }, 0);

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
      {isPositionsEvent &&
        (() => {
          // Show bomb plant marker only when exactly 1 round is selected
          let bombPlantSeconds: number | null = null;
          if (rounds.length === 1) {
            const bp = match.bombsPlanted.find((bp) => bp.roundNumber === rounds[0]);
            if (bp) {
              const round = match.rounds.find((r) => r.number === rounds[0]);
              if (round) {
                bombPlantSeconds = (bp.tick - round.freezetimeEndTick) / match.tickrate;
              }
            }
          }

          return (
            <TimeRangeSlider
              startSeconds={startSeconds}
              endSeconds={Math.min(endSeconds, maxRoundDurationSeconds)}
              maxDurationSeconds={maxRoundDurationSeconds}
              bombPlantSeconds={bombPlantSeconds}
              onChange={(start, end) => {
                dispatch(timeRangeChanged({ startSeconds: start, endSeconds: end }));
                void fetchPoints({ startSeconds: start, endSeconds: end });
              }}
            />
          );
        })()}
      <div className="flex flex-wrap gap-x-8">
        <ResetZoomButton />
        <ExportHeatmapButton />
      </div>
    </HeatmapFilters>
  );
}
