import React, { useEffect, useRef, useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { Heatmap } from 'csdm/ui/components/heatmap/heatmap';
import { Content } from 'csdm/ui/components/content';
import { useTeamProfileSettings } from 'csdm/ui/settings/use-team-profile-settings';
import { Game } from 'csdm/common/types/counter-strike';
import { useHeatmapState } from './use-heatmap-state';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useCurrentTeamName } from '../use-current-team-name';
import type { TeamHeatmapFilter } from 'csdm/common/types/heatmap-filters';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import type { Point } from 'csdm/common/types/point';
import { TeamHeatmapFilters } from './team-heatmap-filters';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { HeatmapProvider } from 'csdm/ui/components/heatmap/heatmap-provider';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { fetchPointsSuccess } from './team-heatmap-actions';
import { useMaps } from 'csdm/ui/maps/use-maps';

export function TeamHeatmap() {
  const showToast = useShowToast();
  const dispatch = useDispatch();
  const { games, tagIds, demoSources, demoTypes, startDate, endDate, gameModes, maxRounds } = useTeamProfileSettings();
  const game = games.includes(Game.CSGO) ? Game.CSGO : Game.CS2;
  const client = useWebSocketClient();
  const teamName = useCurrentTeamName();
  const { alpha, blur, radius, event, sides, mapName, radarLevel } = useHeatmapState();
  const [points, setPoints] = useState<Point[]>([]);
  const isInitialRender = useRef(true);
  const maps = useMaps();

  const fetchPoints = async (filters?: Partial<TeamHeatmapFilter>) => {
    try {
      const newMapName = filters?.mapName ?? mapName;
      const map = maps.find((map) => {
        return map.name === newMapName && map.game === game;
      });
      const payload: TeamHeatmapFilter = {
        demoTypes,
        endDate,
        event: filters?.event ?? event,
        gameModes,
        games,
        mapName: newMapName,
        maxRounds,
        radarLevel: filters?.radarLevel ?? radarLevel,
        sides: filters?.sides ?? sides,
        sources: demoSources,
        startDate,
        tagIds,
        teamName,
        thresholdZ: map?.thresholdZ ?? null,
      };
      const points = await client.send({
        name: RendererClientMessageName.FetchTeamHeatmapPoints,
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
      fetchPoints();
    }
  });

  return (
    <Content>
      <div className="flex h-full">
        <HeatmapProvider
          game={game}
          mapName={mapName}
          points={points}
          radarLevel={radarLevel}
          alpha={alpha}
          blur={blur}
          radius={radius}
          fetchPoints={fetchPoints}
        >
          <TeamHeatmapFilters />
          <Heatmap />
        </HeatmapProvider>
      </div>
    </Content>
  );
}
