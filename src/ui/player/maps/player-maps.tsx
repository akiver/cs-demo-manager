import React from 'react';
import { Content } from 'csdm/ui/components/content';
import type { MapStats } from 'csdm/common/types/player-profile';
import { roundNumber } from 'csdm/common/math/round-number';
import { CounterTerroristIcon } from '../../icons/counter-terrorist-icon';
import { TerroristIcon } from '../../icons/terrorist-icon';
import { Panel, PanelStatRow } from '../../components/panel';
import { Message } from 'csdm/ui/components/message';
import { usePlayer } from '../use-player';
import { WinRate } from 'csdm/ui/components/panels/win-rate';
import { useGetMapThumbnailSrc } from 'csdm/ui/maps/use-get-map-thumbnail-src';

type Props = {
  mapStats: MapStats;
};

function MapEntry({ mapStats }: Props) {
  const getMapThumbnailSrc = useGetMapThumbnailSrc();

  return (
    <div className="flex gap-x-12 first:pt-0 py-12">
      <div className="flex flex-col self-center">
        <img className="max-w-[200px] rounded-4" src={getMapThumbnailSrc(mapStats.mapName)} alt={mapStats.mapName} />
        <p className="text-center selectable">{mapStats.mapName}</p>
      </div>
      <Panel header="Matches" minWidth={200}>
        <PanelStatRow title="Total" value={mapStats.matchCount} />
        <PanelStatRow title="Win" value={mapStats.winCount} />
        <PanelStatRow title="Lost" value={mapStats.lostCount} />
        <WinRate value={roundNumber((mapStats.winCount / mapStats.matchCount) * 100, 1)} />
      </Panel>
      <Panel header="Rounds" minWidth={200}>
        <PanelStatRow title="Total" value={mapStats.roundCount} />
        <PanelStatRow title="Win" value={mapStats.roundWinCount} />
        <PanelStatRow title="Lost" value={mapStats.roundLostCount} />
        <WinRate value={roundNumber((mapStats.roundWinCount / mapStats.roundCount) * 100, 1)} />
      </Panel>
      <Panel header="Sides" minWidth={200}>
        <div className="flex flex-col gap-y-4">
          <div className="flex items-center gap-x-4">
            <CounterTerroristIcon width={32} />
            <WinRate
              value={roundNumber((mapStats.roundWinCountAsCt / mapStats.roundCount) * 100, 1)}
              barClassName="bg-ct"
            />
          </div>
          <div className="flex items-center gap-x-4">
            <TerroristIcon width={32} />
            <WinRate
              value={roundNumber((mapStats.roundWinCountAsT / mapStats.roundCount) * 100, 1)}
              barClassName="bg-terro"
            />
          </div>
        </div>
      </Panel>
      <Panel header="Impact">
        <PanelStatRow title="K/D" value={roundNumber(mapStats.killDeathRatio, 2)} />
        <PanelStatRow title="ADR" value={roundNumber(mapStats.averageDamagesPerRound, 1)} />
        <PanelStatRow title="KAST" value={roundNumber(mapStats.kast, 1)} />
        <PanelStatRow title="HS%" value={roundNumber(mapStats.headshotPercentage, 1)} />
      </Panel>
    </div>
  );
}

export function PlayerMaps() {
  const { mapsStats } = usePlayer();

  if (mapsStats.length === 0) {
    return <Message message={'No maps stats found.'} />;
  }

  return (
    <Content>
      <div className="flex flex-col divide-y">
        {mapsStats.map((mapStats) => {
          return <MapEntry key={mapStats.mapName} mapStats={mapStats} />;
        })}
      </div>
    </Content>
  );
}
