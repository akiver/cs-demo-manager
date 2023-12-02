import React from 'react';
import { GrenadeName } from 'csdm/common/types/counter-strike';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { roundNumber } from 'csdm/common/math/round-number';
import { Cell } from 'csdm/ui/match/grenades/stats/cells/cell';
import { CellText } from 'csdm/ui/match/grenades/stats/cells/cell-text';

type Props = {
  playerSteamId: string;
};

export function HeGrenadeCells({ playerSteamId }: Props) {
  const match = useCurrentMatch();
  const playerDamages = match.damages.filter(
    (damage) =>
      damage.attackerSteamId === playerSteamId &&
      damage.attackerSide !== damage.victimSide &&
      damage.weaponName === GrenadeName.HE &&
      !damage.isAttackerControllingBot,
  );

  const totalDamageCount = playerDamages.reduce((previousHealthDamage, { healthDamage }) => {
    return previousHealthDamage + healthDamage;
  }, 0);

  const heGrenadesThrown = match.shots.filter((shot) => {
    return shot.playerSteamId === playerSteamId && shot.weaponName === GrenadeName.HE && !shot.isPlayerControllingBot;
  });

  let enemiesDamagedPerHeGrenadeCount = 0;
  const steamIdsDamagedPerUniqueThrow: { [uniqueId: string]: string[] } = {};
  for (const shot of heGrenadesThrown) {
    const damages = playerDamages.filter((damage) => damage.weaponUniqueId === shot.weaponId);
    for (const damage of damages) {
      if (steamIdsDamagedPerUniqueThrow[damage.weaponUniqueId] === undefined) {
        steamIdsDamagedPerUniqueThrow[damage.weaponUniqueId] = [];
      }

      const isSteamIdPresent = steamIdsDamagedPerUniqueThrow[damage.weaponUniqueId].includes(damage.victimSteamId);
      if (!isSteamIdPresent) {
        enemiesDamagedPerHeGrenadeCount++;
        steamIdsDamagedPerUniqueThrow[damage.weaponUniqueId].push(damage.victimSteamId);
      }
    }
  }

  const heGrenadeThrownCount = heGrenadesThrown.length;
  let damagePerThrow = 0;
  if (heGrenadeThrownCount > 0) {
    damagePerThrow = roundNumber(totalDamageCount / heGrenadeThrownCount, 2);
    enemiesDamagedPerHeGrenadeCount = roundNumber(enemiesDamagedPerHeGrenadeCount / heGrenadeThrownCount, 2);
  }

  const killCount = match.kills.filter((kill) => {
    return (
      kill.killerSteamId === playerSteamId &&
      kill.weaponName === GrenadeName.HE &&
      !kill.isKillerControllingBot &&
      kill.killerSide !== kill.victimSide
    );
  }).length;

  const roundCount = match.rounds.length;
  let damagePerRound = 0;
  if (roundCount > 0) {
    damagePerRound = roundNumber(totalDamageCount / roundCount, 2);
  }

  return (
    <>
      <Cell>
        <CellText>{heGrenadeThrownCount}</CellText>
      </Cell>
      <Cell>
        <CellText>{totalDamageCount}</CellText>
      </Cell>
      <Cell>
        <CellText>{damagePerThrow}</CellText>
      </Cell>
      <Cell>
        <CellText>{enemiesDamagedPerHeGrenadeCount}</CellText>
      </Cell>
      <Cell>
        <CellText>{damagePerRound}</CellText>
      </Cell>
      <Cell>
        <CellText>{killCount}</CellText>
      </Cell>
    </>
  );
}
