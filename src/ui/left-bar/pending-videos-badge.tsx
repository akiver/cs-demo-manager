import React from 'react';
import { NumberBadge } from '../components/number-badge';
import { LeftBarBadge } from './left-bar-badge';
import { useVideos } from '../videos/use-videos';
import { VideoStatus } from 'csdm/common/types/video-status';

export function PendingVideosBadge() {
  const videos = useVideos();
  const videosNotCompleted = videos.filter((video) => {
    return video.status !== VideoStatus.Success && video.status !== VideoStatus.Error;
  });

  return (
    <LeftBarBadge>
      <NumberBadge number={videosNotCompleted.length} />
    </LeftBarBadge>
  );
}
