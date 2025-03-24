import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import type { WeaponName } from 'csdm/common/types/counter-strike';
import { Panel, PanelTitle } from 'csdm/ui/components/panel';
import type { Match } from 'csdm/common/types/match';
import type { MatchPlayer } from 'csdm/common/types/match-player';
import type { Kill } from 'csdm/common/types/kill';
import { roundNumber } from 'csdm/common/math/round-number';

function Value({ children }: { children: ReactNode }) {
  return <span className="text-right selectable">{children}</span>;
}

type WeaponStats = {
  weaponName: WeaponName;
  shotCount: number;
  hitCount: number;
  accuracy: number;
  killCount: number;
  damageCount: number;
  headshotPercentage: number;
};

function buildWeaponsStats(match: Match, player: MatchPlayer, kills: Kill[]): WeaponStats[] {
  const stats: WeaponStats[] = [];

  for (const kill of kills) {
    const weaponName = kill.weaponName;
    const hasStats = stats.some((weaponStats) => weaponStats.weaponName === weaponName);
    if (!hasStats) {
      const shotCount = match.shots.filter((shot) => {
        return shot.weaponName === weaponName && shot.playerSteamId === player.steamId;
      }).length;
      const damages = match.damages.filter((damage) => {
        return damage.weaponName === weaponName && damage.attackerSteamId === player.steamId;
      });
      const hitCount = damages.length;
      const damageCount = damages.reduce((total, damage) => total + damage.healthDamage, 0);
      const weaponKills = kills.filter((kill) => {
        return kill.weaponName === weaponName;
      });
      const headshotKillCount = weaponKills.filter((kill) => {
        return kill.isHeadshot;
      }).length;
      const killCount = weaponKills.length;
      const accuracy = shotCount === 0 ? 0 : roundNumber((hitCount / shotCount) * 100);
      const headshotPercentage = killCount === 0 ? 0 : roundNumber((headshotKillCount / killCount) * 100);

      stats.push({
        weaponName,
        shotCount,
        hitCount,
        killCount,
        damageCount,
        accuracy,
        headshotPercentage,
      });
    }
  }

  return stats.sort((dataA, dataB) => dataB.killCount - dataA.killCount);
}

type Props = {
  match: Match;
  player: MatchPlayer;
  kills: Kill[];
};

export function WeaponsPanel({ match, player, kills }: Props) {
  const stats = buildWeaponsStats(match, player, kills);

  return (
    <Panel
      header={
        <PanelTitle>
          <Trans context="Panel title">Weapons</Trans>
        </PanelTitle>
      }
      fitHeight={true}
    >
      <div className="grid grid-cols-7 gap-8 text-gray-900">
        <p>
          <Trans context="Panel label">Name</Trans>
        </p>
        <p className="text-right">
          <Trans context="Panel label">Kills</Trans>
        </p>
        <p className="text-right">
          <Trans context="Panel label">HS%</Trans>
        </p>
        <p className="text-right">
          <Trans context="Panel label">Damages</Trans>
        </p>
        <p className="text-right">
          <Trans context="Panel label">Shots</Trans>
        </p>
        <p className="text-right">
          <Trans context="Panel label">Hits</Trans>
        </p>
        <p className="text-right">
          <Trans context="Panel label">Accuracy</Trans>
        </p>
      </div>
      {stats.map((stat) => {
        return (
          <div className="grid grid-cols-7 gap-8" key={stat.weaponName}>
            <span className="selectable">{stat.weaponName}</span>
            <Value>{stat.killCount}</Value>
            <Value>{stat.headshotPercentage}</Value>
            <Value>{stat.damageCount}</Value>
            <Value>{stat.shotCount}</Value>
            <Value>{stat.hitCount}</Value>
            <Value>{`${stat.accuracy}%`}</Value>
          </div>
        );
      })}
    </Panel>
  );
}
