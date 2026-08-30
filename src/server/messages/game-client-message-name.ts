import type { CameraCoordinates } from 'csdm/common/types/camera';

// Message names sent from the game process to the WebSocket server.
export const GameClientMessageName = {
  Status: 'status',
  CapturePlayerViewResult: 'capture-player-view-result',
} as const;

export type GameClientMessageName = (typeof GameClientMessageName)[keyof typeof GameClientMessageName];

export interface GameClientMessagePayload {
  [GameClientMessageName.Status]: 'ok';
  [GameClientMessageName.CapturePlayerViewResult]: CameraCoordinates | void; // CameraCoordinates is available only in CS:GO.
}
