// Message names sent from the game process to the WebSocket server.
export const GameClientMessageName = {
  Status: 'status',
} as const;

export type GameClientMessageName = (typeof GameClientMessageName)[keyof typeof GameClientMessageName];

export interface GameClientMessagePayload {
  [GameClientMessageName.Status]: 'ok';
}
