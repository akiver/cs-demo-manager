import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/macro';
import { TeamNumber } from 'csdm/common/types/counter-strike';
import { useGetMapThumbnailSrc } from 'csdm/ui/maps/use-get-map-thumbnail-src';
import { CounterTerroristIcon } from 'csdm/ui/icons/counter-terrorist-icon';
import { TerroristIcon } from 'csdm/ui/icons/terrorist-icon';
import { useFormatDate } from 'csdm/ui/hooks/use-format-date';

export function MapImage({ mapName }: { mapName: string }) {
  const getMapThumbnailSrc = useGetMapThumbnailSrc();

  return <img className="h-32" src={getMapThumbnailSrc(mapName)} />;
}

export function TeamSideIcon({ side }: { side: TeamNumber }) {
  return (
    <div>{side === TeamNumber.CT ? <CounterTerroristIcon className="h-32" /> : <TerroristIcon className="h-32" />}</div>
  );
}

export function PlayerName({ name }: { name: string }) {
  return <p className="text-gray-900">{name}</p>;
}

export function RoundNumber({ roundNumber }: { roundNumber: number }) {
  return (
    <p>
      <Trans>Round {roundNumber}</Trans>
    </p>
  );
}

export function MatchDate({ date }: { date: string }) {
  const formatDate = useFormatDate();

  return (
    <p>
      {formatDate(date, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      })}
    </p>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center flex-1 justify-between gap-x-8 px-16 py-8 bg-gray-75 border border-gray-300 rounded overflow-x-auto scrollbar-stable">
      {children}
    </div>
  );
}

export function RowLeft({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-x-8 flex-none">{children}</div>;
}

export function RowRight({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-x-8">{children}</div>;
}
