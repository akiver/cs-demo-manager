import React from 'react';
import type { Game, TeamNumber } from 'csdm/common/types/counter-strike';
import { MatchScore } from 'csdm/ui/downloads/sidebar/match-score';
import { MatchDate } from 'csdm/ui/downloads/sidebar/match-date';
import { MatchResultText } from './match-result-text';
import { MatchResult } from 'csdm/ui/downloads/match-result';
import { MatchDownloadStatus } from './match-download-status';
import type { DownloadStatus } from 'csdm/common/types/download-status';
import { useGetMapThumbnailSrc } from 'csdm/ui/maps/use-get-map-thumbnail-src';
import { useSecondsToFormattedMinutes } from 'csdm/ui/hooks/use-seconds-to-formatted-minutes';

type Props = {
  isSelected: boolean;
  selectMatch: () => void;
  result: MatchResult;
  downloadStatus?: DownloadStatus;
  mapName: string;
  scoreOnTheLeft: number;
  scoreOnTheRight: number;
  sideOnTheLeft?: TeamNumber;
  sideOnTheRight?: TeamNumber;
  date: string;
  duration: number;
  game: Game;
};

export function MatchEntry({
  mapName,
  scoreOnTheLeft,
  scoreOnTheRight,
  sideOnTheLeft,
  sideOnTheRight,
  isSelected,
  selectMatch,
  result,
  downloadStatus,
  date,
  duration,
  game,
}: Props) {
  const getMapThumbnailSrc = useGetMapThumbnailSrc();
  const secondsToFormattedMinutes = useSecondsToFormattedMinutes();

  const borderLeftClasses = {
    [MatchResult.Defeat]: 'border-l-red-700',
    [MatchResult.Victory]: 'border-l-green-400',
    [MatchResult.Tied]: 'border-l-blue-400',
    [MatchResult.Unplayed]: 'border-l-gray-800',
  };

  return (
    <div
      className={`flex items-center border-b border-b-gray-300 cursor-pointer p-8 border-l-2 ${
        isSelected ? 'bg-gray-100' : 'bg-gray-50 hover:bg-gray-75'
      } ${borderLeftClasses[result]}`}
      onClick={selectMatch}
    >
      <div className="flex flex-col items-center">
        <img className="w-[128px] h-[64px]" src={getMapThumbnailSrc(mapName, game)} alt={mapName} />
        <p>{mapName}</p>
      </div>
      <div className="flex flex-col items-center pl-8">
        <div className="flex items-center justify-around w-full">
          <MatchScore teamNumber={sideOnTheLeft} score={scoreOnTheLeft} />
          <p className="text-body-strong">-</p>
          <MatchScore teamNumber={sideOnTheRight} score={scoreOnTheRight} />
        </div>
        <div className="text-caption">
          <MatchDate date={date} />
          <p>{secondsToFormattedMinutes(duration)}</p>
        </div>
        <MatchResultText result={result} />
        {downloadStatus !== undefined && <MatchDownloadStatus status={downloadStatus} />}
      </div>
    </div>
  );
}
