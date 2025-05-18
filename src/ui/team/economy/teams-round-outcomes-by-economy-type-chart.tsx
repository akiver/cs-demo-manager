import React, { useState, type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { TeamNumber } from 'csdm/common/types/counter-strike';
import { SideSelect } from 'csdm/ui/components/inputs/select/side-select';
import type { TeamEconomyStats } from 'csdm/common/types/team-economy-stats';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { roundNumberPercentage } from 'csdm/common/math/round-number-percentage';
import { Section } from 'csdm/ui/components/section';

function LegendItem({ className, label }: { className: string; label: ReactNode }) {
  return (
    <div className="flex items-center gap-x-4">
      <div className={`w-32 h-16 ${className}`} />
      <p className="text-body-strong">{label}</p>
    </div>
  );
}

type BarProps = {
  max: number;
  value: number;
  colorClassName: string;
  tooltip: ReactNode;
};

function Bar({ max, value, colorClassName, tooltip }: BarProps) {
  const height = value === 0 ? 20 : `${(value / max) * 100}%`;
  const className = value === 0 ? 'border border-gray-400' : colorClassName;

  return (
    <Tooltip content={tooltip} delay={0} placement="top">
      <div
        className={`w-32 flex items-center justify-center animate-grow-height transition-all duration-300 ${className}`}
        style={{ height }}
      >
        <span className={`text-white ${value.toString().length > 3 ? '-rotate-90' : ''}`}>
          {max === 0 ? '-' : value}{' '}
        </span>
      </div>
    </Tooltip>
  );
}

type BarsProps = {
  total: number;
  won: number;
  lost: number;
  label: ReactNode;
};

function Bars({ total, won, lost, label }: BarsProps) {
  const wonPercentage = total === 0 ? 0 : roundNumberPercentage(won / total);

  return (
    <div className="flex flex-col gap-y-4 mt-8 border border-gray-300 bg-gray-100 rounded-4 p-4">
      <Tooltip content={<Trans>Won percentage</Trans>} delay={0}>
        <p className="text-subtitle text-center">{total === 0 ? '-' : `${wonPercentage}%`}</p>
      </Tooltip>
      <div className="flex items-end h-[200px] mt-auto">
        <Bar colorClassName="bg-blue-700" max={total} value={total} tooltip={<Trans>Total: {total}</Trans>} />
        <Bar colorClassName="bg-green-700" tooltip={<Trans>Won: {won}</Trans>} max={total} value={won} />
        <Bar colorClassName="bg-red-700" tooltip={<Trans>Lost: {lost}</Trans>} max={total} value={lost} />
      </div>
      <p className="text-center text-body-strong">{label}</p>
    </div>
  );
}

type TeamChartProps = {
  teamName: string;
  economyStats: TeamEconomyStats;
  sides: TeamNumber[];
  showTeamName?: boolean;
};

function TeamChart({ teamName, economyStats, sides, showTeamName = true }: TeamChartProps) {
  const isAllSides = sides.length === 0;
  const labels = {
    eco: <Trans context="Economy type">Eco</Trans>,
    pistol: <Trans context="Economy type">Pistol</Trans>,
    semi: <Trans context="Economy type">Semi</Trans>,
    forceBuy: <Trans context="Economy type">Force-buy</Trans>,
    full: <Trans context="Economy type">Full</Trans>,
  };
  const types = ['pistol', 'eco', 'semi', 'forceBuy', 'full'] as const;

  return (
    <div className="flex flex-col h-auto">
      <div className="flex gap-x-16">
        {showTeamName && <p className="text-body-strong">{teamName}</p>}
        <div className="flex gap-x-8">
          <LegendItem className="bg-blue-700" label={<Trans>Total</Trans>} />
          <LegendItem className="bg-green-700" label={<Trans>Won</Trans>} />
          <LegendItem className="bg-red-700" label={<Trans>Lost</Trans>} />
        </div>
      </div>

      <div className="flex gap-x-16">
        {types.map((type) => {
          const total = isAllSides
            ? economyStats[`${type}Count`]
            : sides.includes(TeamNumber.CT)
              ? economyStats[`${type}WonAsCtCount`] + economyStats[`${type}LostAsCtCount`]
              : economyStats[`${type}WonAsTCount`] + economyStats[`${type}LostAsTCount`];
          const won = isAllSides
            ? economyStats[`${type}WonCount`]
            : sides.includes(TeamNumber.CT)
              ? economyStats[`${type}WonAsCtCount`]
              : economyStats[`${type}WonAsTCount`];
          const lost = isAllSides
            ? economyStats[`${type}LostCount`]
            : sides.includes(TeamNumber.CT)
              ? economyStats[`${type}LostAsCtCount`]
              : economyStats[`${type}LostAsTCount`];

          return <Bars key={type} total={total} won={won} lost={lost} label={labels[type]} />;
        })}
      </div>
    </div>
  );
}

type Props = {
  economyStats: TeamEconomyStats[];
  showTeamName?: boolean;
};

export function TeamsRoundOutcomesByEconomyTypeChart({ economyStats, showTeamName }: Props) {
  const [selectedSides, setSelectedSides] = useState<TeamNumber[]>([]);

  if (economyStats.length === 0) {
    return null;
  }

  return (
    <Section title={<Trans>Round outcomes by economy type</Trans>}>
      <div className="my-12">
        <SideSelect
          selectedSides={selectedSides}
          onChange={(side) => {
            setSelectedSides(side === undefined ? [] : [side]);
          }}
          direction="horizontal"
        />
      </div>
      <div className="flex items-center gap-16 flex-wrap">
        {economyStats.map((stats) => {
          return (
            <TeamChart
              key={stats.teamName}
              teamName={stats.teamName}
              economyStats={stats}
              sides={selectedSides}
              showTeamName={showTeamName}
            />
          );
        })}
      </div>
    </Section>
  );
}
