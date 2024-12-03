import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Panel } from '../../../components/panel';
import { useCurrentRound } from './use-current-round';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { TeamText } from 'csdm/ui/components/team-text';
import type { Clutch } from 'csdm/common/types/clutch';

export function Clutches() {
  const currentRound = useCurrentRound();
  const match = useCurrentMatch();
  const clutches = match.clutches.filter((clutch) => {
    return clutch.roundNumber === currentRound.number;
  });

  function renderPanelContent(clutches: Clutch[]) {
    if (clutches.length === 0) {
      return (
        <p>
          <Trans>No clutches in this round</Trans>
        </p>
      );
    }

    return clutches.map((clutch) => {
      const clutcherName = (
        <TeamText className="inline-block" teamNumber={clutch.side}>
          {clutch.clutcherName}
        </TeamText>
      );
      const opponentCount = clutch.opponentCount;
      return (
        <p key={`${clutch.clutcherName}-${clutch.tick}`}>
          {clutch.won ? (
            <Trans>
              {clutcherName} won a 1v{opponentCount}
            </Trans>
          ) : (
            <Trans>
              {clutcherName} lost a 1v{opponentCount}
            </Trans>
          )}
        </p>
      );
    });
  }

  return (
    <Panel header={<Trans context="Panel title">Clutches</Trans>} fitHeight={true}>
      {renderPanelContent(clutches)}
    </Panel>
  );
}
