import { CliClientMessageName } from 'csdm/server/messages/cli-client-message-name';
import type { Handler } from 'csdm/server/messages/handler';
import type { Daemon } from 'csdm/common/types/daemon';
import type { AddVideoPayload, Video } from 'csdm/common/types/video';
import { getDaemonStatusHandler } from './cli-process/get-daemon-status-handler';
import { shutdownDaemonHandler } from './cli-process/shutdown-daemon-handler';
import type {
  AddDemoPathsToAnalysesPayload,
  AddDemoPathsToAnalysesResult,
} from './cli-process/add-demo-paths-to-analyses-handler';
import { addDemoPathsToAnalysesHandler } from './cli-process/add-demo-paths-to-analyses-handler';
import { addVideoToQueueFromCliHandler } from './cli-process/add-video-to-queue-from-cli-handler';
import { removeDemosFromAnalysesHandler } from './renderer-process/demo/remove-demos-from-analyses-handler';
import type { VideoQueueState } from './cli-process/get-video-queue-handler';
import { getVideoQueueHandler } from './cli-process/get-video-queue-handler';
import { pauseVideoQueueHandler } from './renderer-process/video/pause-video-queue-handler';
import { resumeVideoQueueHandler } from './renderer-process/video/resume-video-queue-handler';
import { removeVideosFromQueueHandler } from './renderer-process/video/remove-videos-from-queue-handler';
import { installHlaeHandler } from './renderer-process/video/install-hlae-handler';
import { installVirtualDubHandler } from './renderer-process/video/install-virtual-dub-handler';
import { installFfmpegHandler } from './renderer-process/video/install-ffmpeg-handler';

export interface CliMessageHandlers {
  [CliClientMessageName.GetDaemonStatus]: Handler<void, Daemon>;
  [CliClientMessageName.ShutdownDaemon]: Handler;
  [CliClientMessageName.AddDemoPathsToAnalyses]: Handler<AddDemoPathsToAnalysesPayload, AddDemoPathsToAnalysesResult>;
  [CliClientMessageName.RemoveDemosFromAnalyses]: Handler<string[]>;
  [CliClientMessageName.AddVideoToQueue]: Handler<AddVideoPayload, Video>;
  [CliClientMessageName.PauseVideoQueue]: Handler;
  [CliClientMessageName.ResumeVideoQueue]: Handler;
  [CliClientMessageName.GetVideoQueue]: Handler<void, VideoQueueState>;
  [CliClientMessageName.RemoveVideosFromQueue]: Handler<string[]>;
  [CliClientMessageName.InstallHlae]: Handler<void, string>;
  [CliClientMessageName.InstallVirtualDub]: Handler<void, string>;
  [CliClientMessageName.InstallFfmpeg]: Handler<void, string>;
}

// Mapping between message names and server handlers sent from the CLI process to the WebSocket server.
export const cliHandlers: CliMessageHandlers = {
  [CliClientMessageName.GetDaemonStatus]: getDaemonStatusHandler,
  [CliClientMessageName.ShutdownDaemon]: shutdownDaemonHandler,
  [CliClientMessageName.AddDemoPathsToAnalyses]: addDemoPathsToAnalysesHandler,
  [CliClientMessageName.RemoveDemosFromAnalyses]: removeDemosFromAnalysesHandler,
  [CliClientMessageName.AddVideoToQueue]: addVideoToQueueFromCliHandler,
  [CliClientMessageName.PauseVideoQueue]: pauseVideoQueueHandler,
  [CliClientMessageName.ResumeVideoQueue]: resumeVideoQueueHandler,
  [CliClientMessageName.GetVideoQueue]: getVideoQueueHandler,
  [CliClientMessageName.RemoveVideosFromQueue]: removeVideosFromQueueHandler,
  [CliClientMessageName.InstallHlae]: installHlaeHandler,
  [CliClientMessageName.InstallVirtualDub]: installVirtualDubHandler,
  [CliClientMessageName.InstallFfmpeg]: installFfmpegHandler,
};

// Probe sockets are short-lived connections used by processes about to spawn a daemon: they can only check that a
// healthy daemon is listening on a port and ask an outdated idle daemon to exit.
export const probeHandlers = {
  [CliClientMessageName.GetDaemonStatus]: getDaemonStatusHandler,
  [CliClientMessageName.ShutdownDaemon]: shutdownDaemonHandler,
};
