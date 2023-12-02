import React from 'react';
import type { ReactNode } from 'react';
import { TeamNumber, WeaponName } from 'csdm/common/types/counter-strike';
import { WEAPONS_ICONS } from 'csdm/ui/components/weapons-icons';
import type { Kill } from 'csdm/common/types/kill';
import { HeadshotIcon } from 'csdm/ui/icons/headshot-icon';
import { FlashbangAssistIcon } from 'csdm/ui/icons/flashbang-assist-icon';
import { ExplosionIcon } from 'csdm/ui/icons/explosion-icon';
import { WorldIcon } from 'csdm/ui/icons/weapons/world-icon';
import { RevengeIcon } from 'csdm/ui/icons/revenge-icon';
import { TeamText } from 'csdm/ui/components/team-text';
import { useGetTimeElapsedBetweenFrames } from 'csdm/ui/match/use-time-elapsed-between-frames';
import { PenetrateIcon } from 'csdm/ui/icons/penetrate-icon';
import { BlindIcon } from 'csdm/ui/icons/blind-icon';

function isBombDeathKill(kill: Kill) {
  return kill.killerSide === TeamNumber.UNASSIGNED && kill.killerName === WeaponName.World;
}

function isSuicideKill(kill: Kill) {
  return kill.killerName === WeaponName.World && kill.weaponName === WeaponName.World;
}

function renderTradeKillIcon(kill: Kill) {
  if (!kill.isTradeKill) {
    return null;
  }

  return <RevengeIcon height={20} />;
}

function renderBlindKillIcon(kill: Kill) {
  if (!kill.isKillerBlinded) {
    return null;
  }

  return <BlindIcon height={20} />;
}

function renderKillerName(kill: Kill) {
  if (isBombDeathKill(kill)) {
    return null;
  }

  if (isSuicideKill(kill)) {
    return <TeamText teamNumber={kill.victimSide}>{kill.victimName}</TeamText>;
  }

  return <TeamText teamNumber={kill.killerSide}>{kill.killerName}</TeamText>;
}

function renderAssister(kill: Kill) {
  const { assisterName, assisterSide, isAssistedFlash } = kill;
  if (assisterName === '' || assisterSide === TeamNumber.UNASSIGNED) {
    return null;
  }

  return (
    <>
      <p>+</p>
      {isAssistedFlash && <FlashbangAssistIcon height={20} />}
      <TeamText teamNumber={assisterSide}>{assisterName}</TeamText>
    </>
  );
}

function renderWeaponIcon(kill: Kill) {
  if (isSuicideKill(kill)) {
    return <WorldIcon height={20} />;
  }

  if (isBombDeathKill(kill)) {
    return <ExplosionIcon height={20} />;
  }

  const WeaponIcon = WEAPONS_ICONS[kill.weaponName];
  if (WeaponIcon === undefined) {
    return '?';
  }

  return <WeaponIcon height={20} />;
}

function renderWeapon(kill: Kill) {
  return (
    <div className="flex gap-8">
      {renderWeaponIcon(kill)}
      {kill.penetratedObjects > 0 && <PenetrateIcon height={20} />}
      {kill.isHeadshot && <HeadshotIcon height={20} />}
    </div>
  );
}

function renderVictimName(kill: Kill) {
  return <TeamText teamNumber={kill.victimSide}>{kill.victimName}</TeamText>;
}

type TimeElapsedOption = {
  roundStartFrame: number;
  frameRate: number;
};

type Props = {
  kill: Kill;
  timeElapsedOption?: TimeElapsedOption;
  right?: ReactNode;
};

export function KillFeedEntry({ kill, timeElapsedOption, right }: Props) {
  const getTimeElapsedBetweenFrames = useGetTimeElapsedBetweenFrames();

  return (
    <div className="flex items-center gap-8">
      {timeElapsedOption && (
        <p className="w-48">
          {getTimeElapsedBetweenFrames({
            frameRate: timeElapsedOption.frameRate,
            startFrame: timeElapsedOption.roundStartFrame,
            endFrame: kill.frame,
          })}
        </p>
      )}
      {renderTradeKillIcon(kill)}
      {renderBlindKillIcon(kill)}
      {renderKillerName(kill)}
      {renderAssister(kill)}
      {renderWeapon(kill)}
      {renderVictimName(kill)}
      <div className="ml-auto">{right}</div>
    </div>
  );
}
