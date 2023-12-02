import React, { useState } from 'react';
import type { Axis } from 'csdm/ui/player/charts/x-axis';
import { XAxis } from 'csdm/ui/player/charts/x-axis';
import { Content } from 'csdm/ui/components/content';
import { HeadshotPercentageChart } from 'csdm/ui/player/charts/headshot-percentage-chart';
import { KillDeathRatioChart } from 'csdm/ui/player/charts/kill-death-ratio-chart';
import { AverageDamagePerRoundChart } from 'csdm/ui/player/charts/average-damage-per-round-chart';
import { ActionBar } from 'csdm/ui/components/action-bar';
import { CompetitiveRankRepartitionChart } from './competitive-rank-repartition-chart';
import { MatchCountChart } from './match-count-chart';
import { ClutchWonPercentageChart } from './clutch-won-percentage-chart';
import { PremierRankRepartitionChart } from './premier-rank-repartition-chart';

export function PlayerCharts() {
  const [axis, setAxisX] = useState<Axis>('day');

  return (
    <>
      <ActionBar
        left={
          <>
            <XAxis
              selectedAxis={axis}
              onChange={(axis: Axis) => {
                setAxisX(axis);
              }}
            />
          </>
        }
      />
      <Content>
        <div className="flex">
          <MatchCountChart axis={axis} />
          <HeadshotPercentageChart axis={axis} />
        </div>
        <div className="flex">
          <KillDeathRatioChart axis={axis} />
          <AverageDamagePerRoundChart axis={axis} />
        </div>
        <div className="flex">
          <ClutchWonPercentageChart axis={axis} />
        </div>
        <div className="flex items-center gap-x-12">
          <CompetitiveRankRepartitionChart />
          <PremierRankRepartitionChart />
        </div>
      </Content>
    </>
  );
}
