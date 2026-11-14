import React from 'react';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { roundNumberPercentage } from 'csdm/common/math/round-number-percentage';
import { getGrenadeOptionNames, type GrenadeOption } from 'csdm/ui/match/grenades/stats/grenade-option';
import { getGrenadeBuyStats } from 'csdm/ui/match/grenades/stats/get-grenade-buy-stats';
import { Cell } from 'csdm/ui/match/grenades/stats/cells/cell';
import { CellText } from 'csdm/ui/match/grenades/stats/cells/cell-text';

type Props = {
  playerSteamId: string;
  grenade: GrenadeOption;
};

export function GrenadeBuyCells({ playerSteamId, grenade }: Props) {
  const match = useCurrentMatch();
  // Old demos don't contain buys
  if (match.grenadeBuys.length === 0) {
    return null;
  }

  const { boughtCount, usedCount } = getGrenadeBuyStats(
    match.grenadeBuys,
    match.shots,
    playerSteamId,
    getGrenadeOptionNames(grenade),
  );

  return (
    <>
      <Cell>
        <CellText>{boughtCount}</CellText>
      </Cell>
      <Cell>
        <CellText>{boughtCount > 0 ? `${roundNumberPercentage(usedCount / boughtCount)}%` : '-'}</CellText>
      </Cell>
    </>
  );
}
