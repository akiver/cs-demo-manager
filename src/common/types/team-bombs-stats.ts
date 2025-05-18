export type TeamBombsStats = {
  plantCount: number;
  plantCountSiteA: number;
  plantCountSiteB: number;
  roundsWonDueToBombExplosion: number; // The team planted the bomb and it exploded
  roundsWonByPlayerDeaths: number; // The team planted the bomb and all players of the enemy team died
  roundsLostDueToDefusal: number; // The team planted the bomb and the enemy team defused it
  roundsLostDueToBombExplosion: number; // The enemy team planted the bomb and it exploded
  roundsWonDueToDefusal: number; // The enemy team planted the bomb and the team defused it
  roundsLostDueToPlayerDeaths: number; // The enemy team planted the bomb and all players of the team died
};
