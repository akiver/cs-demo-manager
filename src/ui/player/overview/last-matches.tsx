import React from 'react';
import { Trans } from '@lingui/macro';
import type { LastMatch as Match } from 'csdm/common/types/player-profile';
import { LastMatch } from './last-match';
import { Panel, PanelTitle } from 'csdm/ui/components/panel';
import { usePlayer } from '../use-player';

function renderMatches(matches: Match[]) {
  if (matches.length === 0) {
    return (
      <p>
        <Trans>No matches.</Trans>
      </p>
    );
  }

  return matches.map((match) => {
    return <LastMatch key={match.checksum} match={match} />;
  });
}

export function LastMatches() {
  const { lastMatches } = usePlayer();

  return (
    <Panel
      header={
        <PanelTitle>
          <Trans context="Panel title">Last matches</Trans>
        </PanelTitle>
      }
    >
      <div className="flex gap-x-12">{renderMatches(lastMatches)}</div>
    </Panel>
  );
}
