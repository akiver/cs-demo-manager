import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useSearchState } from './use-search-state';
import { Status } from 'csdm/common/types/status';
import { Message } from 'csdm/ui/components/message';
import { SearchEvent } from 'csdm/common/types/search/search-event';
import { MultiKillsResults } from './results/multi-kills-results';
import { ClutchesResults } from './results/clutches-results';
import { assertNever } from 'csdm/common/assert-never';
import { WallbangKillsResults } from './results/wallbang-kills-results';
import type { WallbangKillResult } from 'csdm/common/types/search/wallbang-kill-result';
import { CollateralKillsResults } from './results/collateral-kills-results';
import type { CollateralKillResult } from 'csdm/common/types/search/collateral-kill-result';
import type { KillResult } from 'csdm/common/types/search/kill-result';
import { KillsResults } from './results/kills-results';
import { NinjaDefuseResults } from './results/ninja-defuse-results';
import type { NinjaDefuseResult } from 'csdm/common/types/search/ninja-defuse-result';
import type { MultiKillResult } from 'csdm/common/types/search/multi-kill-result';
import type { ClutchResult } from 'csdm/common/types/search/clutch-result';
import { useMatchChecksums } from 'csdm/ui/cache/use-match-checksums';
import { RoundsResult } from './results/rounds-result';
import type { RoundResult } from 'csdm/common/types/search/round-result';

export function SearchResults() {
  const { status, result, event } = useSearchState();
  const matchChecksums = useMatchChecksums();

  if (matchChecksums.length === 0) {
    return <Message message={<Trans>You have to analyze demos first to search for events.</Trans>} />;
  }

  if (status === Status.Idle) {
    return <Message message={<Trans>Click on the search button to reveal events.</Trans>} />;
  }

  if (status === Status.Loading) {
    return <Message message={<Trans>Searching…</Trans>} />;
  }

  if (status === Status.Error) {
    return <Message message={<Trans>An error occurred.</Trans>} />;
  }

  if (status === Status.Success && result.length === 0) {
    return <Message message={<Trans>No results found.</Trans>} />;
  }

  switch (event) {
    case SearchEvent.FiveKill:
    case SearchEvent.FourKill:
      return <MultiKillsResults multiKills={result as MultiKillResult[]} />;
    case SearchEvent.OneVsFive:
    case SearchEvent.OneVsFour:
    case SearchEvent.OneVsThree:
      return <ClutchesResults clutches={result as ClutchResult[]} />;
    case SearchEvent.WallbangKills:
      return <WallbangKillsResults kills={result as WallbangKillResult[]} />;
    case SearchEvent.CollateralKills:
      return <CollateralKillsResults kills={result as CollateralKillResult[]} />;
    case SearchEvent.KnifeKills:
    case SearchEvent.JumpKills:
    case SearchEvent.TeamKills:
    case SearchEvent.NoScopeKills:
    case SearchEvent.ThroughSmokeKills:
      return <KillsResults kills={result as KillResult[]} />;
    case SearchEvent.NinjaDefuse:
      return <NinjaDefuseResults bombsDefused={result as NinjaDefuseResult[]} />;
    case SearchEvent.RoundStart:
      return <RoundsResult rounds={result as RoundResult[]} />;
    default:
      return assertNever(event, 'Unknown search type');
  }
}
