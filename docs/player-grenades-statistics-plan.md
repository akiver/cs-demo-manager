# Player Grenades Statistics Tab Plan

## Goal

Add a `Grenades` tab to the player profile page. The tab should show aggregated grenade statistics for the current
player across all matches included by the active player filters.

The first implementation should focus on useful cross-match averages:

- Average flashbangs, HE grenades, smokes, and fire grenades thrown per match.
- Average grenade throws per round.
- Flashbang impact: flashed enemies, blind duration, flashed enemies per throw, flashed enemies per match.
- HE impact: damage, damage per throw, damage per match, kills.
- Fire impact: damage, damage per throw, damage per match.
- Optional flashbang matchup table showing who this player flashes most often.

## Implementation Status

Status on 2026-07-08: implemented and locally committed.

Related commits:

- `14d10ced feat(player): add grenades statistics tab`
- `a6866cfb feat(player): refine grenades statistics`
- Current follow-up: reuse the project table component for sortable/resizable Grenades tables and patch local zh-CN
  preview translations from the installed app.

Current behavior:

- The player profile has a `Grenades` tab.
- The tab fetches stats lazily through `FetchPlayerGrenadesStats`.
- The first row uses summary panels for high-signal per-match stats.
- `Grenade averages` uses the shared project `Table` component, so columns can be sorted and resized like Players/Teams.
- Flashbang matchup data is split into two tables:
  - `Players flashed by this player`
  - `Players who flashed this player`
- Flashbang matchup tables also use the shared project `Table` component and persist their column state with dedicated
  table names.
- Metrics intentionally count enemy impact only for flash, HE damage, fire damage, and HE kills.

Validation last run:

- `vp run compile`
- `vp run lint`
- `vp run test`
- `vp run deadcode`
- `vp run build`

Notes:

- `vp check` could not run in the current Codex shell because Vite+ could not resolve the `node` binary path, but the
  individual checks above passed.
- `vp run package --dir` was blocked by sandboxed network access. The preview build was produced by repacking the
  current `out` folder into an existing custom `win-unpacked` shell.

## Merge-Friendly Constraints

- Do not change the demo analyzer.
- Do not change the database schema.
- Do not refactor the existing match `Grenades` page.
- Do not add grenade data to the main `PlayerProfile` payload unless it becomes necessary.
- Prefer a new lazy-loaded player grenades endpoint so the existing player overview query stays stable.
- Keep new files under narrow feature folders:
  - `src/node/database/player/`
  - `src/server/handlers/renderer-process/player/`
  - `src/ui/player/grenades/`
  - `src/common/types/`

## Data Flow

```mermaid
flowchart LR
  UI["Player Grenades tab"] --> WS["Renderer WebSocket message"]
  WS --> Handler["fetch-player-grenades-stats-handler"]
  Handler --> Query["fetchPlayerGrenadesStats"]
  Query --> DB[("PostgreSQL")]
  DB --> Query
  Query --> Handler
  Handler --> UI
```

## Code Map

Feature entry points:

- `src/ui/player/player-tabs.tsx`: tab link.
- `src/ui/router.tsx`: player route registration.
- `src/ui/player/grenades/player-grenades.tsx`: renderer UI, table layout, fetch state.
- `src/server/renderer-client-message-name.ts`: renderer message enum.
- `src/server/handlers/renderer-process/player/fetch-player-grenades-stats-handler.ts`: WebSocket handler.
- `src/server/handlers/renderer-handlers-mapping.ts`: handler registration.
- `src/node/database/player/fetch-player-grenades-stats.ts`: Kysely queries and metric aggregation.
- `src/common/types/player-grenades-stats.ts`: payload contract shared by server and renderer.
- `src/ui/translations/en/messages.po`: extracted English source strings.
- `src/node/settings/table/table-name.ts`: persistent table names for the three player Grenades tables.
- `scripts/patch-zh-cn-from-installed-app.mjs`: local preview-only zh-CN patcher for installed-app translations plus
  custom Grenades strings.

Data direction:

```mermaid
sequenceDiagram
  participant PlayerPage as Player Grenades UI
  participant Client as WebSocket client
  participant Handler as Renderer handler
  participant Query as fetchPlayerGrenadesStats
  participant DB as PostgreSQL

  PlayerPage->>Client: FetchPlayerGrenadesStats(filters + steamId)
  Client->>Handler: renderer message
  Handler->>Query: fetchPlayerGrenadesStats(steamId, filters)
  Query->>DB: aggregate shots, blinds, damage, kills
  DB-->>Query: rows
  Query-->>Handler: PlayerGrenadesStats
  Handler-->>PlayerPage: summary + matchup tables
```

## Data Sources

Use existing database tables only:

- `players`: match participation and player identity.
- `rounds`: round counts per filtered match.
- `shots`: grenade throws.
- `player_blinds`: flashbang impact.
- `damages`: HE and fire damage.
- `kills`: HE kills.
- `matches` and `demos`: required joins for `applyMatchFilters`.

All queries should reuse `applyMatchFilters` from `src/node/database/match/apply-match-filters.ts`.

## Proposed Types

Create `src/common/types/player-grenades-stats.ts`.

```ts
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
  totalEnemyBlindDuration: number;
  averageEnemyBlindDuration: number;
  averageFlashedEnemiesPerFlashbang: number;
  averageFlashedEnemiesPerMatch: number;
  heDamage: number;
  averageHeDamagePerThrow: number;
  averageHeDamagePerMatch: number;
  heKillCount: number;
  fireDamage: number;
  averageFireDamagePerThrow: number;
  averageFireDamagePerMatch: number;
};

export type PlayerFlashbangMatchup = {
  steamId: string;
  name: string;
  count: number;
  totalDuration: number;
  averageDuration: number;
};

export type PlayerGrenadesStats = {
  summary: PlayerGrenadeSummary;
  flashedPlayers: PlayerFlashbangMatchup[];
  flashedByPlayers: PlayerFlashbangMatchup[];
};
```

`PlayerGrenadeSummary` is intentionally private to the file because only the full `PlayerGrenadesStats` payload is used
across module boundaries.

## Metric Definitions

Use these definitions for the first version:

- Match count: number of filtered matches where the player appears in `players`.
- Round count: rounds from filtered matches where the player appears.
- Grenade thrown count: rows in `shots` for the player and grenade weapon name, excluding bot-controlled throws.
- Fire grenades: `Molotov` plus `Incendiary`.
- Enemy flash count: rows in `player_blinds` where:
  - `flasher_steam_id` is the current player.
  - `flasher_side != flashed_side`.
  - `is_flasher_controlling_bot = false`.
- Enemy blind duration: sum/average of `player_blinds.duration` using the same enemy flash filter.
- Flashed players matchup: grouped by `flashed_steam_id` using the same enemy flash filter.
- Flashed by players matchup: rows in `player_blinds` where:
  - `flashed_steam_id` is the current player.
  - `flasher_side != flashed_side`.
  - `is_flasher_controlling_bot = false`.
- HE damage: sum of `damages.health_damage` where:
  - `attacker_steam_id` is the current player.
  - `weapon_name` is HE.
  - `attacker_side != victim_side`.
  - `is_attacker_controlling_bot = false`.
- Fire damage: same as HE damage, but weapon is `Molotov` or `Incendiary`.
- HE kills: rows in `kills` where:
  - `killer_steam_id` is the current player.
  - weapon is HE.
  - `killer_side != victim_side`.
  - `is_killer_controlling_bot = false`.

For averages:

- `averageXPerMatch = totalX / matchCount`.
- `averageXPerRound = totalX / roundCount`.
- `averageDamagePerThrow = totalDamage / thrownCount`.
- `averageFlashedEnemiesPerFlashbang = flashedEnemyCount / flashbangsThrownCount`.

Use `0` when the denominator is `0`.

## Batch 1: Backend Query

Files:

- Add `src/common/types/player-grenades-stats.ts`.
- Add `src/node/database/player/fetch-player-grenades-stats.ts`.

Tasks:

- [x] Define the `PlayerGrenadesStats` payload type.
- [x] Implement `fetchPlayerGrenadesStats(steamId: string, filters: MatchFilters)`.
- [x] Reuse `applyMatchFilters` for every query.
- [x] Aggregate match count and round count.
- [x] Aggregate throws from `shots`.
- [x] Aggregate flash impact from `player_blinds`.
- [x] Aggregate HE/fire damage from `damages`.
- [x] Aggregate HE kills from `kills`.
- [x] Return a fully populated object with zeros for missing data.
- [x] Return both flashbang matchup directions.

Notes:

- Use Kysely and the style already used in `fetch-player-utility-stats.ts`.
- Keep the SQL readable even if it means several small queries in `Promise.all`.
- Avoid changing `fetchPlayerProfile` in this batch.

Validation:

- [x] `vp run compile`
- [x] `vp run lint`

Suggested commit:

`feat(player): add grenades stats query`

## Batch 2: WebSocket Handler

Files:

- Add `src/server/handlers/renderer-process/player/fetch-player-grenades-stats-handler.ts`.
- Update `src/server/renderer-client-message-name.ts`.
- Update `src/server/handlers/renderer-handlers-mapping.ts`.

Tasks:

- [x] Add `FetchPlayerGrenadesStats: 'fetch-player-grenades-stats'`.
- [x] Define handler payload as `MatchFilters & { steamId: string }`.
- [x] Call `fetchPlayerGrenadesStats(payload.steamId, payload)`.
- [x] Register handler type in `RendererMessageHandlers`.
- [x] Register handler implementation in `rendererHandlers`.

Validation:

- [x] `vp run compile`
- [x] `vp run lint`

Suggested commit:

`feat(player): expose grenades stats endpoint`

## Batch 3: Player Grenades Route

Files:

- Add `src/ui/player/grenades/player-grenades.tsx`.
- Optionally add `src/ui/player/grenades/use-fetch-player-grenades-stats.ts`.
- Update `src/ui/routes-paths.ts`.
- Update `src/ui/router.tsx`.
- Update `src/ui/player/player-tabs.tsx`.

Tasks:

- [x] Add `RoutePath.PlayerGrenades = 'grenades'`.
- [x] Add the `Grenades` tab link in `PlayerTabs`.
- [x] Add a player child route for `PlayerGrenades`.
- [x] In `PlayerGrenades`, read the current player Steam ID and active player filters.
- [x] Fetch stats lazily with `RendererClientMessageName.FetchPlayerGrenadesStats`.
- [x] Show local loading, error, and empty states.

UI wording:

- Tab: `Grenades`
- Panel title: `Grenades`
- Empty state: `No grenade stats found for the current filters.`

Because this batch adds user-visible strings, run i18n extraction.

Validation:

- [x] `vp run compile`
- [x] `vp run lint`
- [x] `vp run i18n:extract`

Suggested commit:

`feat(player): add grenades tab`

## Batch 4: UI Layout and Polish

Files:

- Add small components under `src/ui/player/grenades/`, for example:
  - `grenades-summary.tsx`
  - `grenades-table.tsx`
  - `flashbang-matchups.tsx`

Tasks:

- [x] Add summary panels for the most important per-match averages.
- [x] Add a sortable/resizable table for grenade type rows.
- [x] Split flashbang matchup tables by direction.
- [x] Reuse the shared project `Table` component for all player Grenades tables.
- [x] Keep Tailwind classes to existing spacing/text/color tokens.
- [x] Avoid arbitrary Tailwind values unless the existing component pattern already requires them.
- [x] Clarify ambiguous metrics in labels and subtitles.

Suggested initial summary cards:

- Flashbangs / match
- Enemies flashed / match
- Avg blind time
- HE damage / match
- Fire damage / match
- Smokes / match

Suggested table rows:

- Flashbang
- HE
- Fire
- Smoke

Validation:

- [x] `vp run compile`
- [x] `vp run lint`
- [x] `vp run i18n:extract`

Suggested commit:

`feat(player): display grenades stats`

## Batch 5: Full Validation and Package

Tasks:

- [x] `vp run compile`
- [x] `vp run lint`
- [x] `vp run build`
- [x] `vp run i18n:extract`
- [ ] Optional: `vp run package --dir` blocked by sandboxed network access.

Manual checks:

- [ ] Open a player with many matches.
- [ ] Verify the `Grenades` tab appears.
- [ ] Compare a known match's Grenades values against the player aggregate directionally.
- [ ] Change player filters and confirm stats refresh.
- [ ] Confirm empty/error states do not break the page.

Suggested final commit if batches were not committed separately:

`feat(player): add grenades statistics tab`

## Implementation Order Recommendation

1. Backend query first, because the metric definitions are the core risk.
2. Handler registration second, because it gives a typed boundary.
3. Route and minimal UI third, so the tab can be opened early.
4. Polish layout after the data is known to be correct.
5. Package a custom exe only after the feature is stable.

## Open Questions

- Should "average per game" mean per match or per round? The first version should show both, with labels `Avg / match`
  and `Avg / round`.
- Should flash assists be included as a separate metric? It can be added later from `kills.is_assisted_flash`.
- Should team flashes be shown? The first version should focus on enemy flashes, but the matchup table can add a
  teammate/enemy label later.
- Should 2v2/scrimmage matches be excluded like some current utility stats? The first version should respect active
  filters only; add game-mode-specific exclusions only if the displayed metric explicitly says so.
