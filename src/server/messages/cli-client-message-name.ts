// Message names sent from the CLI process to the WebSocket server.
export const CliClientMessageName = {
  GetDaemonStatus: 'get-daemon-status',
  ShutdownDaemon: 'shutdown-daemon',
  AddDemoPathsToAnalyses: 'cli-add-demo-paths-to-analyses',
  AddVideoToQueue: 'cli-add-video-to-queue',
  PauseVideoQueue: 'cli-pause-video-queue',
  ResumeVideoQueue: 'cli-resume-video-queue',
  GetVideoQueue: 'cli-get-video-queue',
  InstallHlae: 'cli-install-hlae',
  InstallVirtualDub: 'cli-install-virtual-dub',
  InstallFfmpeg: 'cli-install-ffmpeg',
} as const;

export type CliClientMessageName = (typeof CliClientMessageName)[keyof typeof CliClientMessageName];
