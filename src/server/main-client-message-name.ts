// Message names sent from the main Electron process to the WebSocket server.
export const MainClientMessageName = {
  StartMinimizedMode: 'start-minimized-mode',
  HasPendingAnalyses: 'has-pending-analyses',
} as const;

export type MainClientMessageName = (typeof MainClientMessageName)[keyof typeof MainClientMessageName];
