import React from 'react';
import { Content } from 'csdm/ui/components/content';
import { TeamSideStats } from './side/team-side-stats';
import { TeamBombsStats } from './bombs/team-bombs-stats';

export function TeamPerformance() {
  return (
    <Content>
      <div className="flex flex-col gap-16">
        <TeamSideStats />
        <TeamBombsStats />
      </div>
    </Content>
  );
}
