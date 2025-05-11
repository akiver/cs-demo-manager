import type { Migration } from './migration';

// All new database migrations must be added here otherwise it will never run.
// Don't forget to increment the variable CURRENT_SCHEMA_VERSION!
// Migrations are lazy loaded because we don't need to keep them in memory.
export async function getAllMigrations(): Promise<Migration[]> {
  const modules = await Promise.all([
    import('./v1/create-timestamps-table'),
    import('./v1/create-demos-table'),
    import('./v1/create-demo-paths-table'),
    import('./v1/create-matches-table'),
    import('./v1/create-rounds-table'),
    import('./v1/create-teams-table'),
    import('./v1/create-kills-table'),
    import('./v1/create-players-table'),
    import('./v1/create-maps-table'),
    import('./v1/create-shots-table'),
    import('./v1/create-ignored-steam-accounts-table'),
    import('./v1/create-player-blinds-table'),
    import('./v1/create-damages-table'),
    import('./v1/create-player-positions-table'),
    import('./v1/create-inferno-positions-table'),
    import('./v1/create-grenade-positions-table'),
    import('./v1/create-chat-messages-table'),
    import('./v1/create-clutches-table'),
    import('./v1/create-bombs-defuse-start-table'),
    import('./v1/create-bombs-defused-table'),
    import('./v1/create-bombs-planted-table'),
    import('./v1/create-bombs-exploded-table'),
    import('./v1/create-bombs-plant-start-table'),
    import('./v1/create-player-economies-table'),
    import('./v1/create-player-buys-table'),
    import('./v1/create-hostage-pick-up-start-table'),
    import('./v1/create-hostage-picked-up-table'),
    import('./v1/create-hostage-rescued-table'),
    import('./v1/create-hostage-positions-table'),
    import('./v1/create-steam-accounts-table'),
    import('./v1/create-comments-table'),
    import('./v1/create-tags-table'),
    import('./v1/create-checksum-tags-table'),
    import('./v1/create-chicken-deaths-table'),
    import('./v1/create-chicken-positions-table'),
    import('./v1/create-he-grenades-explode-table'),
    import('./v1/create-decoys-start-table'),
    import('./v1/create-smokes-start-table'),
    import('./v1/create-flashbangs-explode-table'),
    import('./v1/create-grenade-bounces-table'),
    import('./v1/create-grenade-projectiles-destroy-table'),
    import('./v1/create-faceit-accounts-table'),
    import('./v1/create-faceit-matches-table'),
    import('./v1/create-faceit-match-players-table'),
    import('./v1/create-faceit-match-teams-table'),
    import('./v1/create-player-comments-table'),
    import('./v1/create-downloads-history-table'),
    import('./v2/create-round-tags-table'),
    import('./v3'),
    import('./v4'),
    import('./v5'),
    import('./v6'),
    import('./v7'),
    import('./v8'),
  ]);

  const migrations = modules.map((module) => module.default);

  return migrations.sort((migrationA, migrationB) => {
    return migrationA.schemaVersion - migrationB.schemaVersion;
  });
}
