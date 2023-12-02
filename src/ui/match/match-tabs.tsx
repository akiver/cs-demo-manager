import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Trans } from '@lingui/macro';
import { TabLinks } from 'csdm/ui/components/tabs/tab-links';
import { TabLink } from 'csdm/ui/components/tabs/tab-link';
import { buildMatchPath, RoutePath } from 'csdm/ui/routes-paths';
import { NextLink, PreviousLink } from 'csdm/ui/components/links';
import { useCurrentMatch } from './use-current-match';
import { isCounterStrikeStartable } from '../hooks/use-counter-strike';

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

  return (
    <TabLinks>
      <PreviousMatchLink />
      <TabLink url="" text={<Trans context="Tab link">Overview</Trans>} />
      <TabLink url={RoutePath.MatchRounds} text={<Trans context="Tab link">Rounds</Trans>} end={false} />
      <TabLink url={RoutePath.MatchPlayers} text={<Trans context="Tab link">Players</Trans>} end={false} />
      <TabLink url={RoutePath.MatchHeatmap} text={<Trans context="Tab link">Heatmap</Trans>} />
      <TabLink url={RoutePath.MatchWeapons} text={<Trans context="Tab link">Weapons</Trans>} />
      <TabLink url={RoutePath.MatchGrenades} text={<Trans context="Tab link">Grenades</Trans>} end={false} />
      <TabLink url={RoutePath.MatchEconomy} text={<Trans context="Tab link">Economy</Trans>} />
      <TabLink url={RoutePath.Match2dViewer} text={<Trans context="Tab link">2D viewer</Trans>} end={false} />
      {isCounterStrikeStartable(match.game) && (
        <TabLink url={RoutePath.MatchVideo} text={<Trans context="Tab link">Video</Trans>} />
      )}
      <TabLink url={RoutePath.MatchChat} text={<Trans context="Tab link">Chat</Trans>} />
      <NextMatchLink />
    </TabLinks>
  );
}
