import React from 'react';
import { GrenadeName } from 'csdm/common/types/counter-strike';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { roundNumber } from 'csdm/common/math/round-number';
import { Cell } from 'csdm/ui/match/grenades/stats/cells/cell';
import { CellText } from 'csdm/ui/match/grenades/stats/cells/cell-text';

type FireCellsProps = {
  playerSteamId: string;
};

export function FireCells({ playerSteamId }: FireCellsProps) {
  const match = useCurrentMatch();
  const playerDamages = match.damages.filter((damage) => {
    return (
      damage.attackerSteamId === playerSteamId &&
      damage.attackerSide !== damage.victimSide &&
      (damage.weaponName === GrenadeName.Molotov || damage.weaponName === GrenadeName.Incendiary) &&
      !damage.isAttackerControllingBot
    );
  });

  const totalDamageCount = playerDamages.reduce((previousHealthDamage, { healthDamage }) => {
    return previousHealthDamage + healthDamage;
  }, 0);

  const grenadeShots = match.shots.filter((shot) => {
    return (
      shot.playerSteamId === playerSteamId &&
      (shot.weaponName === GrenadeName.Molotov || shot.weaponName === GrenadeName.Incendiary) &&
      !shot.isPlayerControllingBot
    );
  });

  let enemiesDamagedPerIncendiaryCount = 0;
  const steamIdsDamagedPerUniqueThrow: { [uniqueId: string]: string[] } = {};
  for (const shot of grenadeShots) {
    const incendiaryDamages = playerDamages.filter((damage) => damage.weaponUniqueId === shot.weaponId);
    for (const damage of incendiaryDamages) {
      if (steamIdsDamagedPerUniqueThrow[damage.weaponUniqueId] === undefined) {
        steamIdsDamagedPerUniqueThrow[damage.weaponUniqueId] = [];
      }

      const isSteamIdPresent = steamIdsDamagedPerUniqueThrow[damage.weaponUniqueId].includes(damage.victimSteamId);
      if (!isSteamIdPresent) {
        enemiesDamagedPerIncendiaryCount++;
        steamIdsDamagedPerUniqueThrow[damage.weaponUniqueId].push(damage.victimSteamId);
      }
    }
  }

  const incendiaryThrownCount = grenadeShots.length;
  let damagePerIncendiaryThrown = 0;
  if (incendiaryThrownCount > 0) {
    damagePerIncendiaryThrown = roundNumber(totalDamageCount / incendiaryThrownCount, 2);
    enemiesDamagedPerIncendiaryCount = roundNumber(enemiesDamagedPerIncendiaryCount / incendiaryThrownCount, 2);
  }

  const roundCount = match.rounds.length;
  let damagesPerRound = 0;
  if (roundCount > 0) {
    damagesPerRound = roundNumber(totalDamageCount / roundCount);
  }

  return (
    <>
      <Cell>
        <CellText>{incendiaryThrownCount}</CellText>
      </Cell>
      <Cell>
        <CellText>{totalDamageCount}</CellText>
      </Cell>
      <Cell>
        <CellText>{damagePerIncendiaryThrown}</CellText>
      </Cell>
      <Cell>
        <CellText>{enemiesDamagedPerIncendiaryCount}</CellText>
      </Cell>
      <Cell>
        <CellText>{damagesPerRound}</CellText>
      </Cell>
    </>
  );
}
