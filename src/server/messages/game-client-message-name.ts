import type { CameraCoordinates } from 'csdm/common/types/camera';

// Message names sent from the game process to the WebSocket server.
export const GameClientMessageName = {
  Status: 'status',
  CapturePlayerViewResult: 'capture-player-view-result',
  AddVideoSequence: 'add-video-sequence',
} as const;

export type GameClientMessageName = (typeof GameClientMessageName)[keyof typeof GameClientMessageName];

// A video sequence marked from the playback panel of the CS2 plugin, to add to the video page of the match.
export type GameVideoSequencePayload = {
  demoPath: string;
  // The match the demo was analyzed into, which the plugin reads from the timeline file the app writes next to the
  // demo. Null when the demo hasn't been analyzed.
  checksum: string | null;
  startTick: number;
  endTick: number;
  // The player spectated when the sequence ended, null when nobody was: a camera, or a bot without a Steam ID.
  focusedPlayer: {
    steamId: string;
    name: string;
  } | null;
};

export interface GameClientMessagePayload {
  [GameClientMessageName.Status]: 'ok';
  [GameClientMessageName.CapturePlayerViewResult]: CameraCoordinates | void; // CameraCoordinates is available only in CS:GO.
  [GameClientMessageName.AddVideoSequence]: GameVideoSequencePayload;
}
