# Match Overview Cumulative Round Progress Plan

## Goal

Add an optional cumulative round filter to the match Overview page. The two team scoreboards should show statistics from
round 1 through the selected round. The default selected round is the last round, so the page initially looks identical
to the current implementation.

The preferred interaction is to reuse the existing winner timeline between the two scoreboards as a progress selector:

- All rounds highlighted by default, meaning the whole match is included.
- Clicking round `N` highlights rounds `1..N` and recomputes both scoreboard tables for that range.
- Each timeline segment keeps its current winner-side positioning and winner color.
- A standard range input is a fallback only if the clickable timeline becomes awkward or inaccessible.

This document is intended for a clean-context Agent. It includes enough code map and implementation order to start the
feature without doing a broad repository scan.

## Implementation Status

Status: implemented on 2026-07-09.

Implementation commit: `f18eb04f feat(match): add overview round progress stats`.

Completed scope:

- The Overview page defaults to full-match stats by selecting the last round.
- The existing winner timeline is now a clickable cumulative progress selector.
- Selecting round `N` recomputes scoreboard rows from rounds `1..N`.
- The last round uses original `match.players` to preserve current full-match behavior and avoid formula drift.
- A pure helper, `buildCumulativeMatchPlayers`, recomputes phase 1 scoreboard fields from loaded match events.
- Unit tests cover full range, round filtering, first kill/death, trade and multi-kill stats, and KAST.
- English Lingui catalog entries were extracted for the new timeline labels/tooltips.

Implemented cumulative fields:

- Kills, deaths, assists, K/D ratio, KPR, DPR.
- Health damage, armor damage, ADR.
- Utility damage and utility damage per round from grenade damage events.
- Headshot count and percentage.
- First kill/death, trade kill/death, first trade kill/death.
- One-kill through five-kill round counts.
- Wallbang, no-scope, and collateral kills.
- Bomb plant/defuse counts.
- Clutch counts and won/lost counts for 1v1 through 1v5.
- KAST from kill, assist, survived, or traded criteria.

Remaining known gaps:

- `mvpCount`, `score`, `hltvRating`, `hltvRating2`, `hostageRescuedCount`, `inspectWeaponCount`, and
  `deathWhileInspectingWeaponCount` remain copied from the full-match row in filtered mode because no per-round source
  is currently loaded in `Match`.
- Unsupported filtered columns remain visible instead of being hidden or marked; this keeps the table implementation
  unchanged but should be revisited if those columns are important for filtered analysis.
- Utility damage uses `WeaponType.Grenade`; if analyzer parity becomes important, compare against analyzer-side utility
  damage definitions.

Validation performed:

- `vp run compile`
- `vp run i18n:extract`
- Targeted `vitest` for `src/ui/match/overview/build-cumulative-match-players.test.ts`
- Targeted `oxlint` for modified Overview files
- Pre-commit `vp check --fix`

## Current Code Map

Overview page:

- `src/ui/match/overview/match-overview.tsx`
  - Renders `MatchInformation`, team A `Scoreboard`, `RoundsTimeline`, and team B `Scoreboard`.
  - Gets the full `match` object from `useCurrentMatch()`.
  - Owns the selected cumulative round state and resets it when `match.checksum` changes.
- `src/ui/match/overview/match-overview-provider.tsx`
  - Uses original `match.players` when the last round is selected.
  - Uses `buildCumulativeMatchPlayers(match, selectedRoundNumber)` when an earlier round is selected.
  - Splits the active player rows into `playersTeamA` and `playersTeamB`.
  - Creates two `useTable` instances.
- `src/ui/match/overview/scoreboard/rounds-timeline.tsx`
  - Renders one `Line` per `Round`.
  - Each `Line` uses `round.winnerSide`, `round.teamASide`, and `getTeamColor()`.
  - Accepts `selectedRoundNumber` and `onSelectRound`.
  - Renders each segment as a button with an accessible label and tooltip.
  - Side switches are shown with `SyncIcon`.
- `src/ui/match/overview/build-cumulative-match-players.ts`
  - Pure helper that creates new `MatchPlayer` rows from match event arrays without mutating `match.players`.
- `src/ui/match/overview/scoreboard/use-scoreboard-columns.ts`
  - Scoreboard columns read fields from `MatchPlayer`.
  - Sorting, resizing, hiding, and formatting already live in the existing table system.

Data types:

- `src/common/types/match.ts`
  - `Match.players` contains full-match precomputed `MatchPlayer[]`.
  - `Match.rounds`, `kills`, `damages`, `blinds`, `shots`, `clutches`, `bombsPlanted`, `bombsDefused`, and
    `bombsExploded` are already loaded for the match detail page.
- `src/common/types/match-player.ts`
  - Defines all scoreboard row fields.
- `src/common/types/kill.ts`
  - Includes `roundNumber`, killer/victim/assister Steam IDs, `isHeadshot`, `isTradeKill`, `isTradeDeath`,
    wallbang/no-scope fields, and weapon metadata.
- `src/common/types/damage.ts`
  - Includes `roundNumber`, attacker/victim Steam IDs, health/armor damage, and weapon type.
- `src/common/types/shot.ts`
  - Includes `roundNumber`, shooter Steam ID, weapon name, and projectile ID.
- `src/common/types/player-blind.ts`
  - Available if future scoreboard columns need flash impact, not currently used by Overview scoreboard columns.
- `src/common/types/clutch.ts`
  - Includes `roundNumber`, clutcher Steam ID, opponent count, and won/lost.
- `src/common/types/round.ts`
  - Includes round number, scores, team sides, winner, and economy values.

Database source:

- `src/node/database/matches/fetch-matches-by-checksums.ts`
  - Fetches the match and all event arrays.
- `src/node/database/match-players/fetch-match-players.ts`
  - Fetches `match.players` from the `players` table.
  - These values are already full-match aggregates, so they cannot be filtered by round without recomputing.

## Feasibility Summary

The UI part is small. The accurate statistics part is medium complexity.

Simple:

- Add selected round state to Overview.
- Reuse `RoundsTimeline` as a clickable cumulative progress control.
- Feed different table data into the existing `Scoreboard` tables.

Medium:

- Recompute `MatchPlayer` fields from event arrays for rounds `1..N`.
- Preserve existing fields that do not depend on the selected range: name, avatar, rank, tags, color, crosshair, ban date,
  team name, and Steam ID.
- Match full-round output with existing full-match `match.players` when `selectedRoundNumber === lastRound.number`.

Avoid:

- Re-querying the database on every timeline click.
- Adding database schema changes.
- Mutating `match.players`.
- Changing shared table behavior.

## UI Design

Prefer a timeline selector over a separate slider.

### Timeline Selector

Extend or wrap `RoundsTimeline` with these props:

```ts
type Props = {
  rounds: Round[];
  selectedRoundNumber: number;
  onSelectRound: (roundNumber: number) => void;
};
```

Behavior:

- Round segment `round.number <= selectedRoundNumber`: highlighted.
- Round segment `round.number > selectedRoundNumber`: muted, using lower opacity or a gray token.
- Click a segment to select that round.
- Keyboard:
  - Each segment should be a `button`, or the container should expose a slider-like control with arrow-key support.
  - The simplest accessible version is one button per round with an `aria-label` such as `Show stats through round 12`.
- Tooltip:
  - `Round {number}: {winnerTeamName} won`
  - If it is the selected round: add a selected state visually, not only via tooltip.

Recommended visual:

- Keep the existing top/bottom alignment so round winner is still readable.
- Use winner color for included rounds.
- Use `bg-gray-400` or reduced opacity for excluded rounds.
- Add a small marker or stronger border on the selected segment.

Fallback:

- Use `src/ui/components/inputs/range-input.tsx` if the timeline proves hard to make accessible.
- Label: `Stats through round {selectedRoundNumber}`.
- Still keep `RoundsTimeline` as a visual-only winner summary.

## State And Data Flow

Add state in `MatchOverview` or a small local provider:

```ts
const lastRoundNumber = match.rounds.at(-1)?.number ?? 0;
const [selectedRoundNumber, setSelectedRoundNumber] = useState(lastRoundNumber);
```

Reset rule:

- If `match.checksum` changes, reset `selectedRoundNumber` to the new match's last round.
- If the selected round is greater than the current match's last round, clamp it.

Pass the selection into `MatchOverviewProvider`:

```tsx
<MatchOverviewProvider selectedRoundNumber={selectedRoundNumber}>
```

Inside the provider:

- If `selectedRoundNumber` is the last round, use `match.players` directly.
- Otherwise compute cumulative players with `buildCumulativeMatchPlayers(match, selectedRoundNumber)`.
- Continue using the same `useTable` calls and same columns.

This keeps sorting, resizing, row selection, context menu, and navigation behavior unchanged.

## Statistics Builder

Create a pure helper next to Overview:

- `src/ui/match/overview/build-cumulative-match-players.ts`
- Unit test: `src/ui/match/overview/build-cumulative-match-players.test.ts`

Suggested signature:

```ts
export function buildCumulativeMatchPlayers(match: Match, selectedRoundNumber: number): MatchPlayer[] {
  // returns new rows, does not mutate match.players
}
```

Implementation approach:

1. Build `includedRounds = match.rounds.filter((round) => round.number <= selectedRoundNumber)`.
2. Build `includedRoundNumbers = new Set(includedRounds.map((round) => round.number))`.
3. Seed one output row per `match.players`, copying identity/static fields from the existing player.
4. Filter events by `includedRoundNumbers`.
5. Accumulate fields per Steam ID.
6. Recalculate derived values.
7. Return rows in the same order as `match.players`.

Static fields to copy from the original `MatchPlayer`:

- `steamId`, `name`, `teamName`, `avatar`, `rankType`, `rank`, `oldRank`, `winsCount`, `color`, `tagIds`,
  `lastBanDate`, `crosshairShareCode`, `inspectWeaponCount`.

Fields to recompute:

- Kills/deaths/assists.
- K/D ratio.
- Health and armor damage.
- ADR, KPR, DPR.
- Utility damage and utility damage per round.
- Headshot count and percentage.
- First kill/death.
- Trade kill/death and first trade kill/death.
- Multi-kill round counts.
- Wallbang, no-scope, and collateral kills.
- Bomb plants/defuses and hostage rescues where supported by loaded events.
- Clutch counts by opponent count and won/lost.
- KAST.
- HLTV 1.0 and 2.0 ratings if formulas are implemented.
- MVP and score if the required event data exists; otherwise see "Known Gaps".

### Suggested MVP Scope

Phase 1 should implement the columns most users read first:

- `killCount`, `assistCount`, `deathCount`
- `killDeathRatio`
- `damageHealth`, `damageArmor`
- `averageDamagePerRound`
- `utilityDamage`, `averageUtilityDamagePerRound`
- `headshotCount`, `headshotPercentage`
- `firstKillCount`, `firstDeathCount`
- `tradeKillCount`, `tradeDeathCount`, `firstTradeKillCount`, `firstTradeDeathCount`
- `oneKillCount` through `fiveKillCount`
- `wallbangKillCount`, `noScopeKillCount`
- `bombPlantedCount`, `bombDefusedCount`
- clutch `vsOne` through `vsFive` counts

For phase 1, keep `hltvRating`, `hltvRating2`, `kast`, `mvpCount`, and `score` copied from full match only if formulas are
not implemented. If copied, document that these columns remain full-match values while filtered mode is active. Better:
hide or mark unsupported columns only in filtered mode, but that is more UI work.

Recommended phase 1 target: implement KAST too, because the tooltip definition is visible in the scoreboard and it can be
derived from kills, assists, deaths, and trade data.

## Statistic Rules

Use existing event fields where possible:

- Kills:
  - Count `kill.killerSteamId`.
  - Count headshots from `kill.isHeadshot`.
  - Count first kills/deaths by taking the earliest kill per round.
  - Count trade kills/deaths from `kill.isTradeKill` and `kill.isTradeDeath`.
  - Count wallbang kills from `kill.penetratedObjects > 0`.
  - Count no-scope kills from `kill.isNoScope`.
- Deaths:
  - Count `kill.victimSteamId`.
- Assists:
  - Count `kill.assisterSteamId` when non-empty.
- Damage:
  - Sum `damage.healthDamage` and `damage.armorDamage` by `damage.attackerSteamId`.
  - Utility damage should filter by grenade/utility weapon types or names. Verify the existing analyzer's full-match
    definition before finalizing.
- Multi-kills:
  - Group kills by `roundNumber` and `killerSteamId`.
  - Increment one of `oneKillCount`, `twoKillCount`, `threeKillCount`, `fourKillCount`, `fiveKillCount`.
- Bombs:
  - Count `bombsPlanted.planterSteamId`.
  - Count `bombsDefused.defuserSteamId`.
- Clutches:
  - Use `match.clutches` filtered by round.
  - Count by `opponentCount` and `won`.
- Collateral:
  - Full-match code currently uses a database helper, not the loaded event array.
  - If the kill event data is enough, derive it locally; otherwise leave this field full-match in phase 1 and document it.
- Hostage rescue:
  - Overview has a hostage rescue column for non-defuse maps, but the current `Match` type does not obviously expose a
    loaded hostage rescue event array. Leave as full-match until the source is found.

KAST:

- For each included round and player, mark the round successful if the player had a kill, assist, survived, or was traded.
- "Survived" means no death for the player in that round.
- "Traded" can use deaths with `isTradeDeath`.
- `kast = successfulRoundCount / includedRoundCount * 100`.

HLTV ratings:

- Existing full-match values are generated by the demo analyzer and stored in the `players` table.
- Only implement local formulas if the team is comfortable with approximate values.
- If formula parity is important, investigate analyzer formulas before implementation.

## Known Gaps And Decisions

Decide before coding full scope:

- Are `score` and `mvpCount` required in filtered mode? If yes, find their event source. They are currently stored on the
  `players` table, not obviously available as per-round arrays in `Match`.
- Should unsupported columns remain visible with full-match values, be hidden in filtered mode, or show a placeholder?
- Should selecting the last round use recomputed stats or the original `match.players`? Recommended: use original
  `match.players` at the last round to guarantee current behavior and avoid formula drift.
- Should selection include warmup or surrender edge cases? Recommended: only use `match.rounds`.

## Implementation Steps And Status

1. [x] Add this plan to `AGENTS.md` as the canonical design document for the feature.
2. [x] Add `selectedRoundNumber` state to `MatchOverview`.
3. [x] Update `RoundsTimeline` to accept `selectedRoundNumber` and `onSelectRound`.
4. [x] Make each round line clickable and keyboard accessible.
5. [x] Pass `selectedRoundNumber` into `MatchOverviewProvider`.
6. [x] Add `buildCumulativeMatchPlayers`.
7. [x] In the provider, use `match.players` when the last round is selected; otherwise use the cumulative helper.
8. [x] Add tests for the helper:
   - Full range returns values matching a simple fixture's expected final totals.
   - Selecting round 1 only excludes round 2 events.
   - First kill/death works per included round.
   - Trade and multi-kill counts work.
   - KAST handles kill, assist, survived, and traded cases.
9. [x] Run `vp run i18n:extract` if new visible strings are added.
10. [x] Run `vp run compile` or `vp check` for validation.

## Merge Safety

Keep the change local to the Overview feature:

- Prefer new helper files under `src/ui/match/overview/`.
- Avoid database migrations.
- Avoid changing `MatchPlayer` shape unless absolutely necessary.
- Avoid changing shared table internals.
- Keep `RoundsTimeline` backward-compatible if other pages begin using it later.

## Suggested Commit Sequence

Use small commits:

1. `docs(match): plan overview round progress stats`
2. `feat(match): add overview round progress selector`
3. `feat(match): compute cumulative overview scoreboard stats`
4. `test(match): cover cumulative overview scoreboard stats`

The implementation Agent can combine commits if the user prefers, but keeping the selector and statistic builder separate
makes review and rollback easier.
