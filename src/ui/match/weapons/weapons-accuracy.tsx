import React, { useState, type ReactNode } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { HitGroup, WeaponType, type TeamNumber, type WeaponName } from 'csdm/common/types/counter-strike';
import type { Damage } from 'csdm/common/types/damage';
import { Body } from './body';
import { RoundsSelect } from 'csdm/ui/components/inputs/select/rounds-select';
import { SideSelect } from 'csdm/ui/components/inputs/select/side-select';
import { PlayersSelect } from 'csdm/ui/components/inputs/select/players-select';
import { TeamsSelect } from 'csdm/ui/components/inputs/select/teams-select';
import { useCurrentMatch } from '../use-current-match';
import { WeaponTypesFilter } from 'csdm/ui/components/inputs/select/weapon-types-filter';
import { roundNumber } from 'csdm/common/math/round-number';
import { ArrowUpLongIcon } from 'csdm/ui/icons/arrow-up-long-icon';
import { ArrowDownLongIcon } from 'csdm/ui/icons/arrow-down-long-icon';
import type { Match } from 'csdm/common/types/match';
import { WEAPONS_ICONS } from 'csdm/ui/components/weapons-icons';

type HitGroupData = {
  killCount: number;
  hitCount: number;
  damageCount: number;
  accuracy: number;
};

function buildHitGroupData(damages: Damage[], totalDamageCount: number): HitGroupData {
  return {
    hitCount: damages.length,
    killCount: damages.filter((damage) => {
      return damage.victimNewHealth === 0;
    }).length,
    damageCount: damages.reduce((previousDamage, damage) => {
      return previousDamage + damage.healthDamage;
    }, 0),
    accuracy: roundNumber((damages.length / totalDamageCount) * 100, 1),
  };
}

function getFilteredDamages(filters: Filter, damages: Damage[], weaponName?: WeaponName) {
  let filteredDamages: Damage[] = damages.filter((damage) => {
    if (damage.weaponType === WeaponType.Melee) {
      return true;
    }
    return damage.hitgroup !== HitGroup.Generic && damage.hitgroup !== HitGroup.Gear;
  });

  if (weaponName) {
    filteredDamages = filteredDamages.filter((damage) => damage.weaponName === weaponName);
  }

  const { roundsNumber, teamNames, steamIds, sides, weaponTypes } = filters;
  if (roundsNumber.length > 0) {
    filteredDamages = filteredDamages.filter((damage) => roundsNumber.includes(damage.roundNumber));
  }

  if (teamNames.length > 0) {
    filteredDamages = filteredDamages.filter((damage) => teamNames.includes(damage.attackerTeamName));
  }

  if (sides.length > 0) {
    filteredDamages = filteredDamages.filter((damage) => sides.includes(damage.attackerSide));
  }

  if (steamIds.length > 0) {
    filteredDamages = filteredDamages.filter((damage) => steamIds.includes(damage.attackerSteamId));
  }

  if (weaponTypes.length > 0) {
    filteredDamages = filteredDamages.filter((damage) => weaponTypes.includes(damage.weaponType));
  }

  return filteredDamages;
}

function getWeaponKills(weaponName: WeaponName, filters: Filter, match: Match) {
  let filteredKills = match.kills.filter((kill) => kill.weaponName === weaponName);
  const { roundsNumber, teamNames, steamIds, sides, weaponTypes } = filters;
  if (roundsNumber.length > 0) {
    filteredKills = filteredKills.filter((kill) => roundsNumber.includes(kill.roundNumber));
  }

  if (teamNames.length > 0) {
    filteredKills = filteredKills.filter((kill) => teamNames.includes(kill.killerTeamName));
  }

  if (sides.length > 0) {
    filteredKills = filteredKills.filter((kill) => sides.includes(kill.killerSide));
  }

  if (steamIds.length > 0) {
    filteredKills = filteredKills.filter((kill) => steamIds.includes(kill.killerSteamId));
  }

  if (weaponTypes.length > 0) {
    filteredKills = filteredKills.filter((kill) => weaponTypes.includes(kill.weaponType));
  }

  return filteredKills;
}

function getWeaponShots(weaponName: WeaponName, filters: Filter, match: Match) {
  let filteredShots = match.shots.filter((shot) => shot.weaponName === weaponName);
  const { roundsNumber, teamNames, steamIds, sides } = filters;
  if (roundsNumber.length > 0) {
    filteredShots = filteredShots.filter((shot) => roundsNumber.includes(shot.roundNumber));
  }

  if (teamNames.length > 0) {
    filteredShots = filteredShots.filter((shot) => teamNames.includes(shot.playerTeamName));
  }

  if (sides.length > 0) {
    filteredShots = filteredShots.filter((shot) => sides.includes(shot.playerSide));
  }

  if (steamIds.length > 0) {
    filteredShots = filteredShots.filter((shot) => steamIds.includes(shot.playerSteamId));
  }

  return filteredShots;
}

function getBodyDataFromFilters(filters: Filter, damages: Damage[]) {
  const filteredDamages: Damage[] = getFilteredDamages(filters, damages);
  const totalDamageCount = filteredDamages.length;
  const leftArmDamages = filteredDamages.filter((damage) => damage.hitgroup === HitGroup.LeftArm);
  const rightArmDamages = filteredDamages.filter((damage) => damage.hitgroup === HitGroup.RightArm);
  const chestDamages = filteredDamages.filter((damage) => damage.hitgroup === HitGroup.Chest);
  const headDamages = filteredDamages.filter((damage) => damage.hitgroup === HitGroup.Head);
  const neckDamages = filteredDamages.filter((damage) => damage.hitgroup === HitGroup.Neck);
  const leftLegDamages = filteredDamages.filter((damage) => damage.hitgroup === HitGroup.LeftLeg);
  const rightLegDamages = filteredDamages.filter((damage) => damage.hitgroup === HitGroup.RightLeg);
  const stomachDamages = filteredDamages.filter((damage) => damage.hitgroup === HitGroup.Stomach);

  const bodyData: HumanBodyData = {
    leftArm: buildHitGroupData(leftArmDamages, totalDamageCount),
    rightArm: buildHitGroupData(rightArmDamages, totalDamageCount),
    chest: buildHitGroupData(chestDamages, totalDamageCount),
    head: buildHitGroupData(headDamages, totalDamageCount),
    neck: buildHitGroupData(neckDamages, totalDamageCount),
    leftLeg: buildHitGroupData(leftLegDamages, totalDamageCount),
    rightLeg: buildHitGroupData(rightLegDamages, totalDamageCount),
    stomach: buildHitGroupData(stomachDamages, totalDamageCount),
  };

  return bodyData;
}

function buildWeaponsStats(filters: Filter, match: Match) {
  const weaponsStats: Record<string, WeaponStat> = {};
  for (const { weaponName, weaponType } of match.damages) {
    if (weaponsStats[weaponName]) {
      continue;
    }

    const damages = getFilteredDamages(filters, match.damages, weaponName);
    const damageCount = damages.reduce((previousDamage, damage) => previousDamage + damage.healthDamage, 0);
    if (damageCount === 0) {
      continue;
    }

    const killCount = getWeaponKills(weaponName, filters, match).length;
    const shotCount = getWeaponShots(weaponName, filters, match).length;
    const hitCount = damages.length;
    const headshotCount = damages.filter((damage) => damage.hitgroup === HitGroup.Head).length;

    weaponsStats[weaponName] = {
      name: weaponName,
      type: weaponType,
      killCount,
      hitCount,
      shotCount,
      damageCount,
      headshotCount,
      accuracy: roundNumber((hitCount / shotCount) * 100, 1),
      headshotPercentage: roundNumber((headshotCount / hitCount) * 100, 1),
    };
  }
  const allStats = Object.values(weaponsStats);
  const rifles = allStats.filter((weapon) => weapon.type === WeaponType.Rifle);
  const pistols = allStats.filter((weapon) => weapon.type === WeaponType.Pistol);
  const smgs = allStats.filter((weapon) => weapon.type === WeaponType.SMG);
  const snipers = allStats.filter((weapon) => weapon.type === WeaponType.Sniper);
  const machineGuns = allStats.filter((weapon) => weapon.type === WeaponType.MachineGun);
  const melee = allStats.filter((weapon) => weapon.type === WeaponType.Melee);

  return { rifles, pistols, smgs, snipers, machineGuns, melee };
}

export type HumanBodyData = {
  head: HitGroupData;
  neck: HitGroupData;
  chest: HitGroupData;
  stomach: HitGroupData;
  leftLeg: HitGroupData;
  rightLeg: HitGroupData;
  leftArm: HitGroupData;
  rightArm: HitGroupData;
};

type Filter = {
  roundsNumber: number[];
  teamNames: string[];
  sides: TeamNumber[];
  steamIds: string[];
  weaponTypes: WeaponType[];
};

type BodyPartProps = {
  text: ReactNode;
  value: HitGroupData;
};

function HitGroupStats({ text, value }: BodyPartProps) {
  return (
    <div className="grid grid-cols-[minmax(auto,100px)_repeat(3,auto)] gap-12 items-center">
      <div className="flex">
        <p className="text-body-strong">{text}</p>
      </div>
      <div className="flex flex-col">
        <p className="selectable">
          <Trans>Damages</Trans>
        </p>
        <p className="text-subtitle selectable">{value.damageCount}</p>
      </div>
      <div className="flex flex-col">
        <p className="selectable">
          <Trans>Hits</Trans>
        </p>
        <p className="text-subtitle selectable">{value.hitCount}</p>
      </div>
      <div className="flex flex-col">
        <p className="selectable">
          <Trans>Kills</Trans>
        </p>
        <p className="text-subtitle selectable">{value.killCount}</p>
      </div>
    </div>
  );
}

type CellProps = {
  children: ReactNode;
};

function Cell({ children }: CellProps) {
  return <div className="px-8 selectable">{children}</div>;
}

type HeaderCellProps = {
  children: ReactNode;
  onClick: () => void;
  sortDirection?: 'asc' | 'desc';
};

function HeaderCell({ children, onClick, sortDirection }: HeaderCellProps) {
  return (
    <div className="flex items-center justify-between px-8" onClick={onClick}>
      <span>{children}</span>
      <div className={`pr-4 ${sortDirection !== undefined ? 'opacity-100' : 'opacity-0'}`}>
        {sortDirection === 'desc' ? <ArrowDownLongIcon height={16} /> : <ArrowUpLongIcon height={16} />}
      </div>
    </div>
  );
}

type WeaponStat = {
  type: WeaponType;
  name: WeaponName;
  killCount: number;
  shotCount: number;
  hitCount: number;
  damageCount: number;
  headshotCount: number;
  accuracy: number;
  headshotPercentage: number;
};

type WeaponTableProps = {
  title: string;
  weapons: WeaponStat[];
};

type Sort = {
  column: keyof WeaponStat;
  direction: 'asc' | 'desc';
};

function WeaponsTable({ weapons, title }: WeaponTableProps) {
  const [sort, setSort] = useState<Sort>({
    column: 'killCount',
    direction: 'desc',
  });
  const isAscSort = sort.direction === 'asc';
  const sortedWeapons = weapons.sort((a, b) => {
    const valueA = a[sort.column];
    const valueB = b[sort.column];
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return isAscSort ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    }

    const sign = isAscSort ? 1 : -1;

    return sign * (Number(valueA) - Number(valueB));
  });

  const updateSort = (column: keyof WeaponStat) => {
    setSort({
      column,
      direction: sort.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  return (
    <div className="flex flex-col">
      <p className="text-body-strong mb-8">{title}</p>
      <div className="grid grid-cols-6 py-4 bg-gray-100 rounded-t">
        <HeaderCell
          onClick={() => {
            updateSort('name');
          }}
          sortDirection={sort.column === 'name' ? sort.direction : undefined}
        >
          <Trans context="Table header">Name</Trans>
        </HeaderCell>
        <HeaderCell
          onClick={() => {
            updateSort('killCount');
          }}
          sortDirection={sort.column === 'killCount' ? sort.direction : undefined}
        >
          <Trans context="Table header">Kills</Trans>
        </HeaderCell>
        <HeaderCell
          onClick={() => {
            updateSort('damageCount');
          }}
          sortDirection={sort.column === 'damageCount' ? sort.direction : undefined}
        >
          <Trans context="Table header">Damages</Trans>
        </HeaderCell>
        <HeaderCell
          onClick={() => {
            updateSort('hitCount');
          }}
          sortDirection={sort.column === 'hitCount' ? sort.direction : undefined}
        >
          <Trans context="Table header">Hits</Trans>
        </HeaderCell>
        <HeaderCell
          onClick={() => {
            updateSort('accuracy');
          }}
          sortDirection={sort.column === 'accuracy' ? sort.direction : undefined}
        >
          <Trans context="Table header">Accuracy</Trans>
        </HeaderCell>
        <HeaderCell
          onClick={() => {
            updateSort('headshotPercentage');
          }}
          sortDirection={sort.column === 'headshotPercentage' ? sort.direction : undefined}
        >
          <Trans context="Table header">HS%</Trans>
        </HeaderCell>
      </div>
      {sortedWeapons.map((weapon) => {
        const WeaponIcon = WEAPONS_ICONS[weapon.name];

        return (
          <div key={weapon.name} className="grid grid-cols-6 border border-gray-200 py-4 last:rounded-b">
            <Cell>
              <div className="flex items-center gap-x-4">
                {WeaponIcon ? <WeaponIcon height={20} /> : <span>?</span>}
                <span className="selectable">{weapon.name}</span>
              </div>
            </Cell>
            <Cell>{weapon.killCount}</Cell>
            <Cell>{weapon.damageCount}</Cell>
            <Cell>{weapon.hitCount}</Cell>
            <Cell>{weapon.accuracy}</Cell>
            <Cell>{weapon.headshotPercentage}</Cell>
          </div>
        );
      })}
    </div>
  );
}

export function WeaponsAccuracy() {
  const match = useCurrentMatch();
  const { t } = useLingui();
  const [filters, setFilters] = useState<Filter>({
    roundsNumber: [],
    teamNames: [],
    sides: [],
    steamIds: [],
    weaponTypes: [],
  });
  const bodyData = getBodyDataFromFilters(filters, match.damages);
  const { rifles, pistols, smgs, snipers, machineGuns, melee } = buildWeaponsStats(filters, match);

  return (
    <div className="flex flex-col gap-y-12">
      <div className="grid grid-cols-[1fr_1fr_auto_auto_1fr] gap-x-8">
        <RoundsSelect
          rounds={match.rounds}
          selectedRoundNumbers={filters.roundsNumber}
          onChange={(roundsNumber: number[]) => {
            setFilters({
              ...filters,
              roundsNumber,
            });
          }}
        />
        <PlayersSelect
          players={match.players}
          selectedSteamIds={filters.steamIds}
          onChange={(steamIds: string[]) => {
            setFilters({
              ...filters,
              steamIds,
            });
          }}
        />
        <TeamsSelect
          teamNameA={match.teamA.name}
          teamNameB={match.teamB.name}
          selectedTeamNames={filters.teamNames}
          onChange={(selectedTeam) => {
            setFilters({
              ...filters,
              teamNames: selectedTeam ? [selectedTeam] : [],
            });
          }}
        />
        <SideSelect
          selectedSides={filters.sides}
          onChange={(selectedSide: TeamNumber | undefined) => {
            setFilters({
              ...filters,
              sides: selectedSide === undefined ? [] : [selectedSide],
            });
          }}
        />
        <WeaponTypesFilter
          onChange={(weaponTypes) => {
            setFilters({
              ...filters,
              weaponTypes,
            });
          }}
          selectedWeaponTypes={filters.weaponTypes}
        />
      </div>

      <div className="flex flex-wrap gap-16">
        <div className="flex flex-col flex-wrap gap-12">
          {rifles.length > 0 && <WeaponsTable title={t`Rifles`} weapons={rifles} />}
          {pistols.length > 0 && <WeaponsTable title={t`Pistols`} weapons={pistols} />}
          {smgs.length > 0 && <WeaponsTable title={t`SMGs`} weapons={smgs} />}
          {snipers.length > 0 && <WeaponsTable title={t`Snipers`} weapons={snipers} />}
          {machineGuns.length > 0 && <WeaponsTable title={t`Machine guns`} weapons={machineGuns} />}
          {melee.length > 0 && <WeaponsTable title={t`Melee`} weapons={melee} />}
        </div>

        <div className="flex h-fit">
          <div className="flex self-center flex-none">
            <Body data={bodyData} width={200} />
          </div>

          <div className="flex flex-col justify-evenly">
            <HitGroupStats text={<Trans>Head</Trans>} value={bodyData.head} />
            <HitGroupStats text={<Trans>Neck</Trans>} value={bodyData.neck} />
            <HitGroupStats text={<Trans>Chest</Trans>} value={bodyData.chest} />
            <HitGroupStats text={<Trans>Stomach</Trans>} value={bodyData.stomach} />
            <HitGroupStats text={<Trans>Left arm</Trans>} value={bodyData.leftArm} />
            <HitGroupStats text={<Trans>Right arm</Trans>} value={bodyData.rightArm} />
            <HitGroupStats text={<Trans>Left leg</Trans>} value={bodyData.leftLeg} />
            <HitGroupStats text={<Trans>Right leg</Trans>} value={bodyData.rightLeg} />
          </div>
        </div>
      </div>
    </div>
  );
}
