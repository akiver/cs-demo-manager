import { useEffect } from 'react';
import { ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import type { WebSocketClient } from 'csdm/ui/web-socket-client';
import {
  pauseQueue,
  resumeQueue,
  videoAddedToQueue,
  videoUpdated,
  videosRemovedFromQueue,
} from 'csdm/ui/videos/videos-actions';
import type { Video } from 'csdm/common/types/video';

export function useRegisterVideoQueueListeners(client: WebSocketClient) {
  const dispatch = useDispatch();

  useEffect(() => {
    const onVideoAddedToQueue = (video: Video) => {
      dispatch(videoAddedToQueue(video));
    };
    client.on(ServerPushMessageName.VideoAddedToQueue, onVideoAddedToQueue);

    const onVideosRemovedFromQueue = (videoIds: string[]) => {
      dispatch(videosRemovedFromQueue(videoIds));
    };
    client.on(ServerPushMessageName.VideosRemovedFromQueue, onVideosRemovedFromQueue);

    const onVideoUpdated = (video: Video) => {
      dispatch(videoUpdated(video));
    };
    client.on(ServerPushMessageName.VideoUpdated, onVideoUpdated);

    const onResume = () => {
      dispatch(resumeQueue());
    };
    client.on(ServerPushMessageName.VideoQueueResumed, onResume);

    const onPause = () => {
      dispatch(pauseQueue());
    };
    client.on(ServerPushMessageName.VideoQueuePaused, onPause);

    return () => {
      client.off(ServerPushMessageName.VideoAddedToQueue, onVideoAddedToQueue);
      client.off(ServerPushMessageName.VideosRemovedFromQueue, onVideosRemovedFromQueue);
      client.off(ServerPushMessageName.VideoUpdated, onVideoUpdated);
      client.off(ServerPushMessageName.VideoQueueResumed, onResume);
      client.off(ServerPushMessageName.VideoQueuePaused, onPause);
    };
  });
}
