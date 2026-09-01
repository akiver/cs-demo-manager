import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { server } from './server';
import { ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';
import { getErrorCodeFromError } from './get-error-code-from-error';
import { ErrorCode } from 'csdm/common/error-code';
import { VideoStatus } from 'csdm/common/types/video-status';
import { generateVideo } from 'csdm/node/video/generation/generate-video';
import { AbortError } from 'csdm/node/errors/abort-error';
import { CommandError } from 'csdm/node/video/errors/command-error';
import type { AddVideoPayload, Video } from 'csdm/common/types/video';

class VideoQueue {
  private videos: Video[] = [];
  private currentVideo: Video | undefined;
  private abortControllers: { [videoId: string]: AbortController | null } = {};
  // Tracks which client connection queued a video so its videos can be canceled when it disconnects.
  private clientIdPerVideoId = new Map<string, string>();
  private isPaused = true;

  public resume() {
    if (!this.isPaused) {
      return;
    }

    this.isPaused = false;
    server.sendPushMessage({
      name: ServerPushMessageName.VideoQueueResumed,
    });
    void this.loopUntilRecodingDone();
  }

  public pause() {
    this.isPaused = true;
    server.sendPushMessage({
      name: ServerPushMessageName.VideoQueuePaused,
    });
  }

  public removeVideos(ids: string[]) {
    for (const id of ids) {
      this.abortVideo(id);
    }
    server.sendPushMessage({
      name: ServerPushMessageName.VideosRemovedFromQueue,
      payload: ids,
    });
  }

  public removeVideosAddedByClient(clientId: string) {
    const videoIds: string[] = [];
    for (const [videoId, ownerClientId] of this.clientIdPerVideoId) {
      if (ownerClientId === clientId) {
        videoIds.push(videoId);
      }
    }

    if (videoIds.length > 0) {
      logger.log(`Removing ${videoIds.length} video(s) added by the client ${clientId}`);
      this.removeVideos(videoIds);
    }
  }

  public isBusy() {
    return this.currentVideo !== undefined || (!this.isPaused && this.videos.length > 0);
  }

  public getIsPaused() {
    return this.isPaused;
  }

  public addVideo(partialVideo: AddVideoPayload, clientId?: string) {
    const isUpdate = partialVideo.id;
    const id = partialVideo.id ?? randomUUID();
    const date = partialVideo.date ?? new Date().toISOString();
    const video: Video = {
      ...partialVideo,
      id,
      date,
      status: VideoStatus.Pending,
      output: '',
      errorCode: undefined,
      // Raw files and output files are stored in a folder named after the video id to avoid overwriting files
      outputFolderPath: isUpdate ? partialVideo.outputFolderPath : path.join(partialVideo.outputFolderPath, id),
    };
    this.videos.push(video);
    this.abortControllers[id] = new AbortController();
    if (typeof clientId === 'string') {
      this.clientIdPerVideoId.set(id, clientId);
    }

    server.sendPushMessage({
      name: ServerPushMessageName.VideoAddedToQueue,
      payload: video,
    });

    if (!this.isPaused) {
      void this.loopUntilRecodingDone();
    }

    return video;
  }

  private abortVideo(id: string) {
    const abortController = this.abortControllers[id];
    if (abortController) {
      abortController.abort();
      delete this.abortControllers[id];
    }
    this.clientIdPerVideoId.delete(id);

    if (this.currentVideo?.id === id) {
      this.currentVideo = undefined;
    }

    this.videos = this.videos.filter((video) => video.id !== id);
  }

  public getVideos = () => {
    if (this.currentVideo) {
      return [...this.videos, this.currentVideo];
    }

    return this.videos;
  };

  private async loopUntilRecodingDone() {
    if (this.currentVideo) {
      return;
    }

    this.currentVideo = this.videos.shift();
    while (this.currentVideo) {
      await this.processVideo(this.currentVideo);
      if (this.isPaused) {
        this.currentVideo = undefined;
        break;
      }
      this.currentVideo = this.videos.shift();
    }
  }

  private readonly processVideo = async (video: Video) => {
    try {
      this.updateCurrentVideoAndNotifyRendererProcess({ status: VideoStatus.Recording });
      const ctrl = new AbortController();
      this.abortControllers[video.id] = ctrl;

      await generateVideo({
        ...video,
        videoId: video.id,
        signal: ctrl.signal,
        onGameStart: () => {
          this.updateCurrentVideoAndNotifyRendererProcess({ status: VideoStatus.Recording });
        },
        onMoveFilesStart: () => {
          this.updateCurrentVideoAndNotifyRendererProcess({ status: VideoStatus.MovingFiles });
        },
        onSequenceStart: (sequenceNumber, sequencePosition) => {
          this.updateCurrentVideoAndNotifyRendererProcess({
            status: VideoStatus.Converting,
            currentSequence: sequenceNumber,
            currentSequencePosition: sequencePosition,
          });
        },
        onConcatenateSequencesStart: () => {
          this.updateCurrentVideoAndNotifyRendererProcess({ status: VideoStatus.Concatenating });
        },
      });
      this.updateCurrentVideoAndNotifyRendererProcess({ status: VideoStatus.Success });
      delete this.abortControllers[video.id];
    } catch (error) {
      if (error instanceof AbortError) {
        this.abortVideo(video.id);
      } else {
        const errorCode = getErrorCodeFromError(error);
        if (errorCode === ErrorCode.UnknownError) {
          logger.error('Error while generating video');
          logger.error(error);
        }

        let output: string | undefined;
        if (error instanceof CommandError) {
          output = error.output;
        } else if (error instanceof Error) {
          output = error.message;
        }

        this.updateCurrentVideoAndNotifyRendererProcess({
          status: VideoStatus.Error,
          output,
          errorCode,
        });
      }
    } finally {
      delete this.abortControllers[video.id];
      this.clientIdPerVideoId.delete(video.id);
    }
  };

  private updateCurrentVideoAndNotifyRendererProcess = (video: Partial<Video>) => {
    if (!this.currentVideo) {
      return;
    }

    this.currentVideo = {
      ...this.currentVideo,
      ...video,
    };
    server.sendPushMessage({
      name: ServerPushMessageName.VideoUpdated,
      payload: this.currentVideo,
    });
  };
}

export const videoQueue = new VideoQueue();
