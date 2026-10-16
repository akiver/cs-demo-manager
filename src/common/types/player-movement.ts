export type PlayerMovement = {
  tick: number;
  playerSteamId: string;
  playerName: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  flashDurationRemaining: number;
  isDucking: boolean;
  isAirborne: boolean;
};
