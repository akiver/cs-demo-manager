import type { Size } from 'csdm/common/types/size';
import type { SharedServerMessagePayload, SharedServerMessageName } from './shared-server-message-name';

// Message names sent from the WebSocket server to the main Electron process.
export const MainServerMessageName = {
  DownloadValveDemoStarted: 'download-valve-demo-started',
  DownloadFaceitDemoStarted: 'download-faceit-demo-started',
  Download5EPlayDemoStarted: 'download-5eplay-demo-started',
  DownloadRenownDemosStarted: 'download-renown-demos-started',
  GetScreenSize: 'get-screen-size',
} as const;

export type MainServerMessageName =
  | (typeof MainServerMessageName)[keyof typeof MainServerMessageName]
  | SharedServerMessageName;

// Request payload sent from WebSocket server to main process
export interface MainServerMessagePayload extends SharedServerMessagePayload {
  [MainServerMessageName.DownloadValveDemoStarted]: number;
  [MainServerMessageName.DownloadFaceitDemoStarted]: number;
  [MainServerMessageName.Download5EPlayDemoStarted]: number;
  [MainServerMessageName.DownloadRenownDemosStarted]: number;
  [MainServerMessageName.GetScreenSize]: void;
}

// Response payload returned from main process to WebSocket server
export interface MainServerMessageResponse {
  [MainServerMessageName.GetScreenSize]: Size;
}
