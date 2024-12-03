import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { RoundEndReason } from 'csdm/common/types/counter-strike';
import { Panel } from 'csdm/ui/components/panel';
import { useCurrentRound } from './use-current-round';

/* eslint-disable lingui/no-unlocalized-strings */
const roundEndReasonText: Record<number, string> = {
  [RoundEndReason.TargetBombed]: 'Target Successfully Bombed!',
  [RoundEndReason.TerroristsEscaped]: 'Terrorists escaped!',
  [RoundEndReason.CounterTerroristsStoppedEscape]: 'Counter-Terrorists stopped Terrorists from escape!',
  [RoundEndReason.TerroristsStopped]: 'Escaping terrorists have all been neutralized!',
  [RoundEndReason.BombDefused]: 'The bomb has been defused!',
  [RoundEndReason.CtWin]: 'Counter-Terrorists win!',
  [RoundEndReason.TerroristWin]: 'Terrorists win!',
  [RoundEndReason.Draw]: 'Round draw!',
  [RoundEndReason.HostagesRescued]: 'All Hostages have been rescued!',
  [RoundEndReason.TargetSaved]: 'Target has been saved!',
  [RoundEndReason.HostagesNotRescued]: 'Hostages have not been rescued!',
  [RoundEndReason.TerroristsNotEscaped]: 'Terrorists have not escaped!',
  [RoundEndReason.GameStart]: 'Game Commencing!',
  [RoundEndReason.TerroristsSurrender]: 'Terrorists surrender!',
  [RoundEndReason.CounterTerroristsSurrender]: 'Counter-Terrorists surrender!',
  [RoundEndReason.TerroristsPlanted]: 'Terrorists Planted the bomb!',
  [RoundEndReason.CounterTerroristsReachedHostage]: 'Counter-Terrorists Reached the hostage!',
};
/* eslint-enable lingui/no-unlocalized-strings */

export function EndReason() {
  const round = useCurrentRound();
  const { t } = useLingui();
  const endReasonText = roundEndReasonText[round.endReason] || t`Unknown`;

  return (
    <Panel header={<Trans context="Panel title">Round end reason</Trans>} fitHeight={true}>
      <p>{endReasonText}</p>
    </Panel>
  );
}
