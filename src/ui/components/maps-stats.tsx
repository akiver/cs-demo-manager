import React from 'react';
import { Content } from 'csdm/ui/components/content';
import type { MapStats } from 'csdm/common/types/map-stats';
import { roundNumber } from 'csdm/common/math/round-number';
import { Message } from 'csdm/ui/components/message';
import { WinRate } from 'csdm/ui/components/panels/win-rate';
import { useGetMapThumbnailSrc } from 'csdm/ui/maps/use-get-map-thumbnail-src';
import { Panel, PanelStatRow } from 'csdm/ui/components/panel';
import { CounterTerroristIcon } from 'csdm/ui/icons/counter-terrorist-icon';
import { TerroristIcon } from 'csdm/ui/icons/terrorist-icon';
import { Trans } from '@lingui/react/macro';

type EntryProps = {
  mapStats: MapStats;
};

function MapEntry({ mapStats }: EntryProps) {
  const getMapThumbnailSrc = useGetMapThumbnailSrc();

  return (
    <div className="flex gap-x-12 first:pt-0 py-12">
      <div className="flex flex-col self-center">
        <img className="max-w-[200px] rounded-4" src={getMapThumbnailSrc(mapStats.mapName)} alt={mapStats.mapName} />
        <p className="text-center selectable">{mapStats.mapName}</p>
      </div>
      <Panel header={<Trans context="Panel title">Matches</Trans>} minWidth={200}>
        <PanelStatRow title={<Trans>Total</Trans>} value={mapStats.matchCount} />
        <PanelStatRow title={<Trans>Win</Trans>} value={mapStats.winCount} />
        <PanelStatRow title={<Trans>Lost</Trans>} value={mapStats.lostCount} />
        <PanelStatRow title={<Trans>Tie</Trans>} value={mapStats.tiedCount} />
        <WinRate value={roundNumber((mapStats.winCount / mapStats.matchCount) * 100, 1)} />
      </Panel>
      <Panel header={<Trans context="Panel title">Rounds</Trans>} minWidth={200}>
        <PanelStatRow title={<Trans>Total</Trans>} value={mapStats.roundCount} />
        <PanelStatRow title={<Trans>Win</Trans>} value={mapStats.roundWinCount} />
        <PanelStatRow title={<Trans>Lost</Trans>} value={mapStats.roundLostCount} />
        <WinRate value={roundNumber((mapStats.roundWinCount / mapStats.roundCount) * 100, 1)} />
      </Panel>
      <Panel header={<Trans context="Panel title">Sides</Trans>} minWidth={200}>
        <div className="flex flex-col gap-y-4">
          <div className="flex items-center gap-x-4">
            <CounterTerroristIcon width={32} />
            <WinRate
              value={roundNumber((mapStats.roundWinCountAsCt / mapStats.roundCountAsCt) * 100, 1)}
              barClassName="bg-ct"
            />
          </div>
          <div className="flex items-center gap-x-4">
            <TerroristIcon width={32} />
            <WinRate
              value={roundNumber((mapStats.roundWinCountAsT / mapStats.roundCountAsT) * 100, 1)}
              barClassName="bg-terro"
            />
          </div>
        </div>
      </Panel>
      <Panel header={<Trans context="Panel title">Impact</Trans>}>
        <PanelStatRow title={<Trans>K/D</Trans>} value={roundNumber(mapStats.killDeathRatio, 2)} />
        <PanelStatRow title={<Trans>ADR</Trans>} value={roundNumber(mapStats.averageDamagesPerRound, 1)} />
        <PanelStatRow title={<Trans>KAST</Trans>} value={roundNumber(mapStats.kast, 1)} />
        <PanelStatRow title={<Trans>HS%</Trans>} value={roundNumber(mapStats.headshotPercentage, 1)} />
      </Panel>
    </div>
  );
}

type Props = {
  mapsStats: MapStats[];
};

export function MapsStats({ mapsStats }: Props) {
  if (mapsStats.length === 0) {
    return <Message message={<Trans>No maps stats found.</Trans>} />;
  }

  return (
    <Content>
      <div className="flex flex-col divide-y divide-gray-300">
        {mapsStats.map((mapStats) => {
          return <MapEntry key={mapStats.mapName} mapStats={mapStats} />;
        })}
      </div>
    </Content>
  );
}
