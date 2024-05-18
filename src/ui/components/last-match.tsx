import React from 'react';
import type { LastMatch as Match } from 'csdm/common/types/last-match';
import { useNavigateToMatch } from 'csdm/ui/hooks/use-navigate-to-match';
import { useFormatDate } from 'csdm/ui/hooks/use-format-date';
import { useGetMapThumbnailSrc } from 'csdm/ui/maps/use-get-map-thumbnail-src';

type Props = {
  match: Match;
};

export function LastMatch({ match }: Props) {
  const formatDate = useFormatDate();
  const getMapThumbnailSrc = useGetMapThumbnailSrc();
  const navigateToMatch = useNavigateToMatch();
  const onClick = () => {
    navigateToMatch(match.checksum);
  };
  const isTieGame = match.winnerName === '';
  const hasPlayerWon = match.winnerName === match.focusTeamName;

  return (
    <div className="flex items-center min-w-fit cursor-pointer gap-x-4" onClick={onClick}>
      <img className="w-[128px]" src={getMapThumbnailSrc(match.mapName, match.game)} />
      <div className="flex flex-col">
        <p>
          {formatDate(match.date, {
            hour: undefined,
            minute: undefined,
            second: undefined,
          })}
        </p>
        <p>{match.mapName}</p>
        <div
          className={`flex justify-center ${
            isTieGame ? 'text-blue-400' : hasPlayerWon ? 'text-green-400' : 'text-red-400'
          }`}
        >
          <p>{match.scoreTeamA}</p>
          <p>:</p>
          <p>{match.scoreTeamB}</p>
        </div>
      </div>
    </div>
  );
}
