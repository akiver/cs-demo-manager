import React from 'react';
import { Content } from 'csdm/ui/components/content';
import { TeamsEconomyTypesChart } from './teams-economy-types-chart';
import { useTeam } from '../use-team';

export function TeamEconomy() {
  const { economyStats } = useTeam();

  return (
    <Content>
      <TeamsEconomyTypesChart economyStats={[economyStats]} />
    </Content>
  );
}
