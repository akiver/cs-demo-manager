import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { LastMatch as Match } from 'csdm/common/types/last-match';
import { LastMatch } from './last-match';
import { Panel, PanelTitle } from 'csdm/ui/components/panel';

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

type Props = {
  matches: Match[];
};

export function LastMatches({ matches }: Props) {
  return (
    <Panel
      header={
        <PanelTitle>
          <Trans context="Panel title">Last matches</Trans>
        </PanelTitle>
      }
    >
      <div className="flex gap-x-12">{renderMatches(matches)}</div>
    </Panel>
  );
}
