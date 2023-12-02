import type { SharedServerMessagePayload, SharedServerMessageName } from './shared-server-message-name';

// Message names sent from the WebSocket server to the main Electron process.
export const MainServerMessageName = {
  DownloadValveDemoStarted: 'download-valve-demo-started',
  DownloadFaceitDemoStarted: 'download-faceit-demo-started',
} as const;

export type MainServerMessageName =
  | (typeof MainServerMessageName)[keyof typeof MainServerMessageName]
  | SharedServerMessageName;

export interface MainServerMessagePayload extends SharedServerMessagePayload {
  [MainServerMessageName.DownloadValveDemoStarted]: number;
  [MainServerMessageName.DownloadFaceitDemoStarted]: number;
}
