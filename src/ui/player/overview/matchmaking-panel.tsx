import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Panel, PanelRow, PanelTitle, PanelValue } from 'csdm/ui/components/panel';
import { usePlayer } from '../use-player';
import { PremierRank } from 'csdm/ui/components/premier-rank';

export function MatchmakingPanel() {
  const { competitiveRank, premierRank, winsCount } = usePlayer();

  return (
    <Panel
      header={
        <PanelTitle>
          <Trans context="Panel title">Matchmaking</Trans>
        </PanelTitle>
      }
      minWidth={200}
    >
      <PanelRow>
        <p>
          <Trans context="Panel label">Premier rank</Trans>
        </p>
        <div className="flex h-full w-[64px] mb-4">
          <PremierRank rank={premierRank} />
        </div>
      </PanelRow>
      <PanelRow>
        <p>
          <Trans context="Panel label">Competitive rank</Trans>
        </p>
        <div className="flex h-full w-[64px] mb-4">
          <img src={window.csdm.getRankImageSrc(competitiveRank)} />
        </div>
      </PanelRow>
      <PanelRow>
        <p>
          <Trans context="Panel label">Wins</Trans>
        </p>
        <PanelValue>{winsCount}</PanelValue>
      </PanelRow>
    </Panel>
  );
}
