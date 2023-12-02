import React from 'react';
import { DownloadActions } from './download-actions';
import type { Download } from 'csdm/common/download/download-types';
import { useSecondsToFormattedMinutes } from 'csdm/ui/hooks/use-seconds-to-formatted-minutes';
import { useFormatDate } from 'csdm/ui/hooks/use-format-date';
import { useGetMapThumbnailSrc } from 'csdm/ui/maps/use-get-map-thumbnail-src';

type Props = {
  download: Download;
};

export function DownloadEntry({ download }: Props) {
  const { mapName, durationInSeconds, date } = download.match;
  const getMapThumbnailSrc = useGetMapThumbnailSrc();
  const secondsToFormattedMinutes = useSecondsToFormattedMinutes();
  const formatDate = useFormatDate();

  return (
    <div className="flex mx-auto py-8 w-[800px] border-b border-b-gray-300">
      <img className="w-[128px] mr-4" src={getMapThumbnailSrc(mapName, download.game)} alt={mapName} />
      <div className="flex flex-col justify-between">
        <p className="text-body-strong selectable">{mapName}</p>
        <div>
          <p className="selectable">{secondsToFormattedMinutes(durationInSeconds)}</p>
          <p className="selectable">{formatDate(date)}</p>
        </div>
      </div>
      <DownloadActions demoFileName={download.fileName} matchId={download.matchId} />
    </div>
  );
}
