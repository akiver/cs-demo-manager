export type KillCameraPov = 'killer' | 'victim';

export type GenerateCamerasForm = {
  playerFocusSteamId: string | undefined;
  killCameraPov: KillCameraPov | undefined;
  beforeKillDelaySeconds: number;
};
