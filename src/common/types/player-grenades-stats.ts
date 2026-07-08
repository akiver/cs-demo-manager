type PlayerGrenadeSummary = {
  steamId: string;
  matchCount: number;
  roundCount: number;
  flashbangsThrownCount: number;
  heGrenadesThrownCount: number;
  smokeGrenadesThrownCount: number;
  fireGrenadesThrownCount: number;
  averageFlashbangsThrownPerMatch: number;
  averageHeGrenadesThrownPerMatch: number;
  averageSmokeGrenadesThrownPerMatch: number;
  averageFireGrenadesThrownPerMatch: number;
  averageFlashbangsThrownPerRound: number;
  averageHeGrenadesThrownPerRound: number;
  averageSmokeGrenadesThrownPerRound: number;
  averageFireGrenadesThrownPerRound: number;
  flashedEnemyCount: number;
  flashedTeammateCount: number;
  flashedByEnemyCount: number;
  flashedByTeammateCount: number;
  totalEnemyBlindDuration: number;
  totalTeammateBlindDuration: number;
  totalBlindDurationFromEnemies: number;
  totalBlindDurationFromTeammates: number;
  averageEnemyBlindDuration: number;
  averageTeammateBlindDuration: number;
  averageBlindDurationFromEnemies: number;
  averageBlindDurationFromTeammates: number;
  averageFlashedEnemiesPerFlashbang: number;
  averageFlashedTeammatesPerFlashbang: number;
  averageFlashedEnemiesPerMatch: number;
  averageFlashedTeammatesPerMatch: number;
  averageFlashedByEnemiesPerMatch: number;
  averageFlashedByTeammatesPerMatch: number;
  heDamage: number;
  averageHeDamagePerThrow: number;
  averageHeDamagePerMatch: number;
  heKillCount: number;
  fireDamage: number;
  averageFireDamagePerThrow: number;
  averageFireDamagePerMatch: number;
};

export type FlashbangPlayerRelation = 'enemy' | 'teammate';

export type PlayerFlashbangMatchup = {
  steamId: string;
  name: string;
  relation: FlashbangPlayerRelation;
  count: number;
  totalDuration: number;
  averageDuration: number;
};

export type PlayerGrenadesStats = {
  summary: PlayerGrenadeSummary;
  flashedPlayers: PlayerFlashbangMatchup[];
  flashedByPlayers: PlayerFlashbangMatchup[];
};
