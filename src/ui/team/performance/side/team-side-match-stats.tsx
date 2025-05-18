import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useTeam } from 'csdm/ui/team/use-team';
import { useTeamSidePie } from 'csdm/ui/hooks/chart/use-team-side-pie';
import { TeamChart, TeamChartPanel, TeamChartPanelHeader } from 'csdm/ui/team/performance/team-chart-panel';

export function TeamSideMatchChart() {
  const { sideStats } = useTeam();
  const { t } = useLingui();

  const { ref } = useTeamSidePie({
    valueCt: sideStats.matchCountStartedAsCt,
    valueT: sideStats.matchCountStartedAsT,
    tooltipCt: t({
      message: 'Matches started as CT',
      context: 'Chart tooltip',
    }),
    tooltipT: t({
      message: 'Matches started as T',
      context: 'Chart tooltip',
    }),
  });

  return (
    <TeamChartPanel>
      <TeamChartPanelHeader title={<Trans context="Chart title">Starting side distribution</Trans>} />
      <TeamChart ref={ref} />
    </TeamChartPanel>
  );
}
