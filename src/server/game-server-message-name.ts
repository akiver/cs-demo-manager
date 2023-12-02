import type { SharedServerMessageName, SharedServerMessagePayload } from './shared-server-message-name';

// Message names sent from the WebSocket server to CS2.
export const GameServerMessageName = {
  PlayDemo: 'playdemo',
} as const;

type PlayDemoPayload = string;

export type GameServerMessageName =
  | (typeof GameServerMessageName)[keyof typeof GameServerMessageName]
  | SharedServerMessageName;

export interface GameServerMessagePayload extends SharedServerMessagePayload {
  [GameServerMessageName.PlayDemo]: PlayDemoPayload;
}
