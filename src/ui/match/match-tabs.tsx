import React from 'react';
import { useLocation, useParams } from 'react-router';
import { Trans } from '@lingui/react/macro';
import { TabLinks } from 'csdm/ui/components/tabs/tab-links';
import { TabLink } from 'csdm/ui/components/tabs/tab-link';
import { buildMatchPath, RoutePath } from 'csdm/ui/routes-paths';
import { NextLink, PreviousLink } from 'csdm/ui/components/links';
import { useCurrentMatch } from './use-current-match';
import { isCounterStrikeStartable } from 'csdm/ui/hooks/use-counter-strike';
import { useCurrentMatchSequences } from 'csdm/ui/match/video/sequences/use-current-match-sequences';
import { TabLinkNumberBadge } from 'csdm/ui/components/tabs/tab-link-number-badge';

function PreviousMatchLink() {
  const location = useLocation();
  const siblingChecksums: string[] = location.state?.siblingChecksums ?? [];
  const { checksum: currentChecksum } = useParams<string>();
  const currentMatchIndex = siblingChecksums?.findIndex((checksum) => checksum === currentChecksum);
  const previousMatchChecksum = siblingChecksums[currentMatchIndex - 1];
  const to = previousMatchChecksum === undefined ? '' : buildMatchPath(previousMatchChecksum);
  const shortcut = window.csdm.isMac ? '⌘+←' : 'CTRL+←';

  return <PreviousLink to={to} tooltip={<Trans>Previous match ({shortcut})</Trans>} />;
}

function NextMatchLink() {
  const { checksum: currentChecksum } = useParams<string>();
  const location = useLocation();
  const siblingChecksums: string[] = location.state?.siblingChecksums ?? [];
  const currentMatchIndex = siblingChecksums?.findIndex((checksum) => checksum === currentChecksum);
  const nextMatchChecksum = siblingChecksums[currentMatchIndex + 1];
  const to = nextMatchChecksum === undefined ? '' : buildMatchPath(nextMatchChecksum);
  const shortcut = window.csdm.isMac ? '⌘+→' : 'CTRL+→';

  return <NextLink to={to} tooltip={<Trans>Next match ({shortcut})</Trans>} />;
}

export function MatchTabs() {
  const match = useCurrentMatch();
  const sequences = useCurrentMatchSequences();

  return (
    <TabLinks>
      <PreviousMatchLink />
      <TabLink url="">
        <Trans context="Tab link">Overview</Trans>
      </TabLink>
      <TabLink url={RoutePath.MatchRounds} end={false}>
        <Trans context="Tab link">Rounds</Trans>
      </TabLink>
      <TabLink url={RoutePath.MatchPlayers} end={false}>
        <Trans context="Tab link">Players</Trans>
      </TabLink>
      <TabLink url={RoutePath.MatchHeatmap}>
        <Trans context="Tab link">Heatmap</Trans>
      </TabLink>
      <TabLink url={RoutePath.MatchWeapons}>
        <Trans context="Tab link">Weapons</Trans>
      </TabLink>
      <TabLink url={RoutePath.MatchDuels} end={false}>
        <Trans context="Tab link">Duels</Trans>
      </TabLink>
      <TabLink url={RoutePath.MatchGrenades} end={false}>
        <Trans context="Tab link">Grenades</Trans>
      </TabLink>
      <TabLink url={RoutePath.MatchEconomy}>
        <Trans context="Tab link">Economy</Trans>
      </TabLink>
      <TabLink url={RoutePath.Match2dViewer} end={false}>
        <Trans context="Tab link">2D viewer</Trans>
      </TabLink>
      {isCounterStrikeStartable(match.game) && (
        <div className="relative">
          <TabLink url={RoutePath.MatchVideo}>
            <Trans context="Tab link">Video</Trans>
          </TabLink>
          <TabLinkNumberBadge number={sequences.length} />
        </div>
      )}
      <TabLink url={RoutePath.MatchChat}>
        <Trans context="Tab link">Chat</Trans>
      </TabLink>
      <NextMatchLink />
    </TabLinks>
  );
}
