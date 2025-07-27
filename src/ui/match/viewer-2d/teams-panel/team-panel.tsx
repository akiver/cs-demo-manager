import React, { type ComponentProps } from 'react';
import { type TeamNumber, WeaponName } from 'csdm/common/types/counter-strike';
import { PlayerRow } from 'csdm/ui/match/viewer-2d/teams-panel/player-row';
import type { PlayerPosition } from 'csdm/common/types/player-position';
import { useViewerContext } from '../use-viewer-context';
import { TeamText } from 'csdm/ui/components/team-text';
import { getTeamColor } from 'csdm/ui/styles/get-team-color';
import { buildPlayerId } from '../build-player-id';

function buildWeaponsFromPlayerPosition(playerPosition: PlayerPosition): WeaponName[] {
  const weapons: string[] = [];
  if (playerPosition.hasDefuseKit) {
    weapons.unshift(WeaponName.DefuseKit);
  }
  weapons.push(
    ...playerPosition.equipments.split(',').filter((weaponName) => weaponName !== WeaponName.Knife),
    ...playerPosition.grenades.split(','),
    ...playerPosition.pistols.split(','),
    ...playerPosition.smgs.split(','),
    ...playerPosition.rifles.split(','),
    ...playerPosition.heavy.split(','),
  );

  return weapons as WeaponName[];
}

type PlayerRowProps = ComponentProps<typeof PlayerRow>;

function buildPlayersFromPositions(playerPositions: PlayerPosition[], teamNumber: TeamNumber): PlayerRowProps[] {
  return playerPositions
    .filter((playerPosition) => playerPosition.side === teamNumber)
    .map((playerPosition) => {
      return {
        steamId: playerPosition.playerSteamId,
        isAlive: playerPosition.isAlive,
        name: playerPosition.playerName,
        money: playerPosition.money,
        weapons: buildWeaponsFromPlayerPosition(playerPosition),
        health: playerPosition.health,
        armor: playerPosition.armor,
        side: playerPosition.side,
        hasHelmet: playerPosition.hasHelmet,
        currentWeaponName: playerPosition.activeWeaponName,
        hasBomb: playerPosition.hasBomb,
      };
    });
}

type Props = {
  teamNumber: TeamNumber;
  teamName: string;
  teamScore: number;
};

export function TeamPanel({ teamNumber, teamName, teamScore }: Props) {
  const { playerPositions, currentTick } = useViewerContext();
  const tickPositions = playerPositions.filter((playerPosition) => playerPosition.tick === currentTick);
  const players: PlayerRowProps[] = buildPlayersFromPositions(tickPositions, teamNumber);

  return (
    <div className="flex flex-col bg-gray-50 border border-gray-300 rounded">
      <div
        className="flex items-center justify-between p-8 bg-gray-50 border-b"
        style={{
          borderBottomColor: getTeamColor(teamNumber),
        }}
      >
        <TeamText teamNumber={teamNumber}>{teamName}</TeamText>
        <TeamText teamNumber={teamNumber} className="text-body-strong">
          {teamScore}
        </TeamText>
      </div>
      {players.map((player) => {
        return <PlayerRow key={buildPlayerId(player.steamId, player.name)} {...player} />;
      })}
    </div>
  );
}
