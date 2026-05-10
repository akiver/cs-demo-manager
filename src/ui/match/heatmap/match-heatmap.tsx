import React, { useEffect, useRef, useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { Heatmap } from 'csdm/ui/components/heatmap/heatmap';
import { MatchHeatmapFilters } from 'csdm/ui/match/heatmap/match-heatmap-filters';
import { Content } from 'csdm/ui/components/content';
import { useCurrentMatch } from '../use-current-match';
import { useHeatmapState } from './use-heatmap-state';
import type { Point } from 'csdm/common/types/point';
import type { MatchHeatmapFilter } from 'csdm/common/types/heatmap-filters';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { fetchPointsSuccess } from './match-heatmap-actions';
import { HeatmapProvider } from 'csdm/ui/components/heatmap/heatmap-provider';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { useCurrentMatchMap } from '../use-current-match-map';
import { HeatmapEvent } from 'csdm/common/types/heatmap-event';

export function MatchHeatmap() {
  const match = useCurrentMatch();
  const map = useCurrentMatchMap();
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const showToast = useShowToast();
  const { alpha, blur, radius, event, sides, radarLevel, rounds, steamIds, teamNames, startSeconds, endSeconds } =
    useHeatmapState();
  const [points, setPoints] = useState<Point[]>([]);
  const isInitialRender = useRef(true);

  const computeTickRanges = (filterRounds: number[], filterStartSeconds: number, filterEndSeconds: number) => {
    const selectedRounds =
      filterRounds.length > 0 ? match.rounds.filter((r) => filterRounds.includes(r.number)) : match.rounds;

    return selectedRounds
      .map((round) => {
        // Seconds are relative to freeze time end (0 = freeze time end)
        const startTick = round.freezetimeEndTick + Math.round(filterStartSeconds * match.tickrate);
        const endTick = Math.min(
          round.freezetimeEndTick + Math.round(filterEndSeconds * match.tickrate),
          round.endTick,
        );
        return {
          roundNumber: round.number,
          startTick,
          endTick,
        };
      })
      .filter((range) => range.startTick <= range.endTick);
  };

  const fetchPoints = async (
    filters?: Partial<MatchHeatmapFilter> & { startSeconds?: number; endSeconds?: number },
  ) => {
    try {
      const effectiveEvent = filters?.event ?? event;
      const effectiveRounds = filters?.rounds ?? rounds;
      const effectiveStartSeconds = filters?.startSeconds ?? startSeconds;
      const effectiveEndSeconds = filters?.endSeconds ?? endSeconds;

      // For Positions event, require a team or player to be selected
      const isPositions = effectiveEvent === HeatmapEvent.Positions;
      const isTimeRangeSupported = effectiveEvent !== HeatmapEvent.Shots && effectiveEvent !== HeatmapEvent.Decoy;

      const effectiveTeamNames = filters?.teamNames ?? teamNames;
      const effectiveSteamIds = filters?.steamIds ?? steamIds;
      // Compute tick ranges if supported for this event
      const tickRanges = isTimeRangeSupported
        ? computeTickRanges(effectiveRounds, effectiveStartSeconds, effectiveEndSeconds)
        : [];

      const payload: MatchHeatmapFilter = {
        checksum: match.checksum,
        event: effectiveEvent,
        rounds: effectiveRounds,
        sides: filters?.sides ?? sides,
        teamNames: effectiveTeamNames,
        steamIds: effectiveSteamIds,
        radarLevel: filters?.radarLevel ?? radarLevel,
        thresholdZ: filters?.thresholdZ ?? map?.thresholdZ ?? null,
        tickRanges,
      };

      if (isPositions && effectiveTeamNames.length === 0 && effectiveSteamIds.length === 0) {
        setPoints([]);
        dispatch(fetchPointsSuccess(payload));
        return;
      }

      const points = await client.send({
        name: RendererClientMessageName.FetchMatchHeatmapPoints,
        payload,
      });
      setPoints(points);
      dispatch(fetchPointsSuccess(payload));
    } catch (error) {
      showToast({
        content: <Trans>An error occurred</Trans>,
        id: 'heatmap-error',
        type: 'error',
      });
    }
  };

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      void fetchPoints();
    }
  });

  return (
    <Content>
      <div className="flex h-full">
        <HeatmapProvider
          game={match.game}
          mapName={match.mapName}
          points={points}
          radarLevel={radarLevel}
          alpha={alpha}
          blur={blur}
          radius={radius}
          fetchPoints={fetchPoints}
        >
          <MatchHeatmapFilters />
          <Heatmap />
        </HeatmapProvider>
      </div>
    </Content>
  );
}
