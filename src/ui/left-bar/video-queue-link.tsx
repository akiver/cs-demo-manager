import React from 'react';
import { Trans } from '@lingui/react/macro';
import { RoutePath } from 'csdm/ui/routes-paths';
import { LeftBarLink } from './left-bar-link';
import { PendingVideosBadge } from './pending-videos-badge';
import { VideoIcon } from '../icons/video-icon';

export function VideoQueueLink() {
  return (
    <LeftBarLink
      icon={
        <div className="relative size-full">
          <PendingVideosBadge />
          <VideoIcon />
        </div>
      }
      tooltip={<Trans context="Tooltip">Videos</Trans>}
      url={RoutePath.Videos}
    />
  );
}
