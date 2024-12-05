import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useVideos } from 'csdm/ui/videos/use-videos';
import { Message } from 'csdm/ui/components/message';
import { VideoEntry } from 'csdm/ui/videos/video-entry';
import { Content } from 'csdm/ui/components/content';
import { RemoveCompletedVideosButton } from './remove-completed-videos-button';
import { RemoveAllVideosButton } from './remove-all-videos-button';
import { ResumeOrPauseVideoQueueButton } from './resume-or-pause-video-queue-button';

export function Videos() {
  const videos = useVideos();

  if (videos.length === 0) {
    return <Message message={<Trans>No video generation in progress.</Trans>} />;
  }

  return (
    <Content>
      <div className="flex items-center gap-x-8">
        <ResumeOrPauseVideoQueueButton />
        <RemoveCompletedVideosButton />
        <RemoveAllVideosButton />
      </div>
      <div className="flex flex-col gap-y-12 mt-12">
        {videos.map((video) => {
          return <VideoEntry key={video.id} video={video} />;
        })}
      </div>
    </Content>
  );
}
