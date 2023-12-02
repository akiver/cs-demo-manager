import React from 'react';
import { TeamEquipmentValuesChart } from './team-equipment-values-chart';
import { TeamEconomyAdvantageChart } from './team-economy-advantage-chart';
import { Content } from 'csdm/ui/components/content';
import { TeamsEconomyBreakdownChart } from './team-economy-breakdown/team-economy-breakdown-chart';

export function Economy() {
  return (
    <Content>
      <div className="flex flex-col gap-12">
        <TeamEquipmentValuesChart />
        <TeamEconomyAdvantageChart />
        <TeamsEconomyBreakdownChart />
      </div>
    </Content>
  );
}
