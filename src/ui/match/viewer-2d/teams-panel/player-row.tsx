import React from 'react';
import { Weapons } from './weapons';
import { CurrentWeapon } from './current-weapon';
import type { TeamNumber, WeaponName } from 'csdm/common/types/counter-strike';
import { HealthArmorState } from './health-armor-state';
import { useViewerContext } from '../use-viewer-context';
import { buildPlayerId } from '../build-player-id';

type Props = {
  steamId: string;
  isAlive: boolean;
  name: string;
  side: TeamNumber;
  health: number;
  armor: number;
  money: number;
  hasHelmet: boolean;
  hasBomb: boolean;
  weapons: WeaponName[];
  currentWeaponName: WeaponName;
};

export function PlayerRow({
  steamId,
  isAlive,
  name,
  health,
  side,
  money,
  hasHelmet,
  hasBomb,
  armor,
  weapons,
  currentWeaponName,
}: Props) {
  const { focusedPlayerId, updateFocusedPlayerId } = useViewerContext();

  const playerId = buildPlayerId(steamId, name);
  const isFocused = focusedPlayerId === playerId;
  const onClick = () => {
    updateFocusedPlayerId(playerId);
  };

  return (
    <div
      className="flex items-center relative p-4 cursor-pointer gap-x-8"
      style={{
        boxShadow: isFocused ? '0 0 0 1px red inset' : undefined,
      }}
      onClick={onClick}
    >
      <HealthArmorState
        health={health}
        armor={armor}
        hasHelmet={hasHelmet}
        side={side}
        isAlive={isAlive}
        hasBomb={hasBomb}
      />
      <div className="flex flex-col justify-center w-[112px]">
        <p className="truncate" title={name}>
          {name}
        </p>
        <p>{`$${money}`}</p>
      </div>
      <Weapons weapons={weapons} currentWeapon={currentWeaponName} playerName={name} />
      {isAlive && <CurrentWeapon weaponName={currentWeaponName} />}
    </div>
  );
}
