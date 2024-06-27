import { useEffect } from 'react';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import type { WebSocketClient } from 'csdm/ui/web-socket-client';
import { videoAddedToQueue, videoUpdated, videosRemovedFromQueue } from 'csdm/ui/videos/videos-actions';
import type { Video } from 'csdm/common/types/video';

export function useRegisterVideoQueueListeners(client: WebSocketClient) {
  const dispatch = useDispatch();

  useEffect(() => {
    const onVideoAddedToQueue = (video: Video) => {
      dispatch(videoAddedToQueue(video));
    };
    client.on(RendererServerMessageName.VideoAddedToQueue, onVideoAddedToQueue);

    const onVideosRemovedFromQueue = (videoIds: string[]) => {
      dispatch(videosRemovedFromQueue(videoIds));
    };
    client.on(RendererServerMessageName.VideosRemovedFromQueue, onVideosRemovedFromQueue);

    const onVideoUpdated = (video: Video) => {
      dispatch(videoUpdated(video));
    };
    client.on(RendererServerMessageName.VideoUpdated, onVideoUpdated);

    return () => {
      client.off(RendererServerMessageName.VideoAddedToQueue, onVideoAddedToQueue);
      client.off(RendererServerMessageName.VideosRemovedFromQueue, onVideosRemovedFromQueue);
      client.off(RendererServerMessageName.VideoUpdated, onVideoUpdated);
    };
  });
}
