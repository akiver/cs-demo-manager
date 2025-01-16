export type SequencePlayerOptions = {
  playerName: string;
  steamId: string;
  // @platform win32 Requires HLAE
  showKill: boolean;
  // @platform win32 Requires HLAE
  highlightKill: boolean;
  isVoiceEnabled: boolean;
};
