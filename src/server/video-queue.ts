import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { server } from './server';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { getErrorCodeFromError } from './get-error-code-from-error';
import { ErrorCode } from 'csdm/common/error-code';
import { VideoStatus } from 'csdm/common/types/video-status';
import { generateVideos } from 'csdm/node/video/generate-videos';
import { AbortError } from 'csdm/node/errors/abort-error';
import { CommandError } from 'csdm/node/video/errors/command-error';
import type { AddVideoPayload, Video } from 'csdm/common/types/video';

class VideoQueue {
  private videos: Video[] = [];
  private currentVideo: Video | undefined;
  private abortControllers: { [videoId: string]: AbortController | null } = {};

  public removeVideos(ids: string[]) {
    for (const id of ids) {
      this.abortVideo(id);
    }
    server.sendMessageToRendererProcess({
      name: RendererServerMessageName.VideosRemovedFromQueue,
      payload: ids,
    });
  }

  public addVideo(partialVideo: AddVideoPayload) {
    const id = randomUUID();
    const video: Video = {
      ...partialVideo,
      id,
      date: new Date().toISOString(),
      status: VideoStatus.Pending,
      output: '',
      // Raw files and output files are stored in a folder named after the video id to avoid overwriting files
      rawFilesFolderPath: path.join(partialVideo.rawFilesFolderPath, id),
      outputFolderPath: path.join(partialVideo.outputFolderPath, id),
    };
    this.videos.push(video);
    this.abortControllers[id] = new AbortController();

    server.sendMessageToRendererProcess({
      name: RendererServerMessageName.VideoAddedToQueue,
      payload: video,
    });

    this.loopUntilRecodingDone();
  }

  private abortVideo(id: string) {
    const abortController = this.abortControllers[id];
    if (abortController) {
      abortController.abort();
      delete this.abortControllers[id];
    }

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

  public hasVideosInProgress = () => {
    return this.hasPendingVideos() || this.currentVideo;
  };

  public clear() {
    this.videos = [];
    this.abortControllers = {};
    this.currentVideo = undefined;
  }

  private hasPendingVideos = () => {
    return this.videos.length > 0;
  };

  private async loopUntilRecodingDone() {
    if (this.currentVideo) {
      return;
    }

    this.currentVideo = this.videos.shift();
    while (this.currentVideo) {
      await this.processVideo(this.currentVideo);
      this.currentVideo = this.videos.shift();
    }
  }

  private readonly processVideo = async (video: Video) => {
    try {
      this.updateCurrentVideoAnNotifyRendererProcess({ status: VideoStatus.Recording });
      const ctrl = new AbortController();
      this.abortControllers[video.id] = ctrl;

      await generateVideos({
        ...video,
        videoId: video.id,
        signal: ctrl.signal,
        onGameStart: () => {
          this.updateCurrentVideoAnNotifyRendererProcess({ status: VideoStatus.Recording });
        },
        onMoveFilesStart: () => {
          this.updateCurrentVideoAnNotifyRendererProcess({ status: VideoStatus.MovingFiles });
        },
        onSequenceStart: (sequenceNumber) => {
          this.updateCurrentVideoAnNotifyRendererProcess({
            status: VideoStatus.Converting,
            currentSequence: sequenceNumber,
          });
        },
        onConcatenateSequencesStart: () => {
          this.updateCurrentVideoAnNotifyRendererProcess({ status: VideoStatus.Concatenating });
        },
      });
      this.updateCurrentVideoAnNotifyRendererProcess({ status: VideoStatus.Success });
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

        this.updateCurrentVideoAnNotifyRendererProcess({
          status: VideoStatus.Error,
          output,
          errorCode,
        });
      }
    } finally {
      delete this.abortControllers[video.id];
    }
  };

  private updateCurrentVideoAnNotifyRendererProcess = (video: Partial<Video>) => {
    if (!this.currentVideo) {
      return;
    }

    this.currentVideo = {
      ...this.currentVideo,
      ...video,
    };
    server.sendMessageToRendererProcess({
      name: RendererServerMessageName.VideoUpdated,
      payload: this.currentVideo,
    });
  };
}

export const videoQueue = new VideoQueue();
