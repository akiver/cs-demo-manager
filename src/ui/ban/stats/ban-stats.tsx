import React, { useState, useEffect } from 'react';
import { Plural, Trans } from '@lingui/react/macro';
import { Message } from 'csdm/ui/components/message';
import { Status } from 'csdm/common/types/status';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { BanPerCompetitiveRankChart } from './ban-per-competitive-rank-chart';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { NoStats } from 'csdm/ui/ban/stats/no-stats';
import { BanPerDateChart } from './ban-per-date-chart';
import { Panel, PanelTitle, PanelValue, PanelValueVariant } from 'csdm/ui/components/panel';
import { Content } from 'csdm/ui/components/content';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { LastBans } from './last-bans';
import { BanPerPremierRankChart } from './ban-per-premier-rank-chart';
import type { BannedSteamAccount } from 'csdm/common/types/banned-steam-account';
import { roundNumber } from 'csdm/common/math/round-number';
import { useBanSettings } from 'csdm/ui/settings/bans/use-ban-settings';

function formatDateToDurationYears(date: string) {
  const now = new Date().getTime();
  const duration = now - new Date(date).getTime();

  const millisecondsPerYear = 1000 * 60 * 60 * 24 * 365.25;
  const years = duration / millisecondsPerYear;

  return roundNumber(years, 1);
}

type State = {
  accountCount: number;
  bannedAccountCount: number;
  bannedAccountPercentage: number;
  bannedAccounts: BannedSteamAccount[];
  averageBannedAccountPerMatch: number;
  averageBannedAccountAgeInYears: number;
  medianBannedAccountAgeInYears: number;
};

export function BanStats() {
  const client = useWebSocketClient();
  const { ignoreBanBeforeFirstSeen } = useBanSettings();
  const [status, setStatus] = useState<Status>(Status.Loading);
  const [stats, setStats] = useState<State>({
    bannedAccountCount: 0,
    accountCount: 0,
    bannedAccountPercentage: 0,
    averageBannedAccountPerMatch: 0,
    bannedAccounts: [],
    averageBannedAccountAgeInYears: 0,
    medianBannedAccountAgeInYears: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await client.send({
          name: RendererClientMessageName.FetchBanStats,
        });
        setStats({
          ...stats,
          medianBannedAccountAgeInYears: stats.medianBannedAccountAgeInMonths
            ? formatDateToDurationYears(stats.medianBannedAccountAgeInMonths)
            : 0,
          averageBannedAccountAgeInYears: stats.averageBannedAccountAgeInMonths
            ? formatDateToDurationYears(stats.averageBannedAccountAgeInMonths)
            : 0,
        });
        setStatus(Status.Success);
      } catch (error) {
        setStatus(Status.Error);
      }
    };

    fetchStats();

    client.on(RendererServerMessageName.IgnoredSteamAccountsChanged, fetchStats);

    return () => {
      client.off(RendererServerMessageName.IgnoredSteamAccountsChanged, fetchStats);
    };
  }, [client, ignoreBanBeforeFirstSeen]);

  if (status === Status.Loading) {
    return <Message message={<Trans>Loading ban stats…</Trans>} />;
  }

  if (status === Status.Error) {
    return <Message message={<Trans>An error occurred</Trans>} />;
  }

  const {
    bannedAccounts,
    bannedAccountCount,
    bannedAccountPercentage,
    averageBannedAccountPerMatch,
    accountCount,
    averageBannedAccountAgeInYears,
    medianBannedAccountAgeInYears,
  } = stats;

  if (accountCount === 0) {
    return <NoStats />;
  }

  return (
    <Content>
      <div className="flex flex-col gap-y-12">
        <div className="flex gap-12 flex-wrap">
          <Panel
            header={
              <>
                <PanelTitle>
                  <Trans context="Panel title">Players</Trans>
                </PanelTitle>
                <PanelValue variant={PanelValueVariant.Big}>{accountCount}</PanelValue>
              </>
            }
          />
          <Panel
            header={
              <>
                <PanelTitle>
                  <Trans context="Panel title">Banned players</Trans>
                </PanelTitle>
                <PanelValue variant={PanelValueVariant.Big}>{bannedAccountCount}</PanelValue>
              </>
            }
          />
          <Panel
            header={
              <>
                <PanelTitle>
                  <Trans context="Panel title">Banned players percentage</Trans>
                </PanelTitle>
                <PanelValue variant={PanelValueVariant.Big}>{`${bannedAccountPercentage}%`}</PanelValue>
              </>
            }
          />
          <Panel
            header={
              <>
                <PanelTitle>
                  <Trans context="Panel title">AVG banned players/match</Trans>
                </PanelTitle>
                <PanelValue variant={PanelValueVariant.Big}>{averageBannedAccountPerMatch}</PanelValue>
              </>
            }
          />
          <Panel
            header={
              <>
                <PanelTitle>
                  <Trans context="Panel title">AVG banned account age</Trans>
                </PanelTitle>
                <PanelValue variant={PanelValueVariant.Big}>
                  <Plural value={averageBannedAccountAgeInYears} one="# year" other="# years" />
                </PanelValue>
              </>
            }
          />
          <Panel
            header={
              <>
                <PanelTitle>
                  <Trans context="Panel title">Median banned account age</Trans>
                </PanelTitle>
                <PanelValue variant={PanelValueVariant.Big}>
                  <Plural value={medianBannedAccountAgeInYears} one="# year" other="# years" />
                </PanelValue>
              </>
            }
          />
        </div>
        <LastBans bannedAccounts={bannedAccounts} />
        <BanPerCompetitiveRankChart bannedAccounts={bannedAccounts} />
        <BanPerPremierRankChart bannedAccounts={bannedAccounts} />
        <BanPerDateChart bannedAccounts={bannedAccounts} />
      </div>
    </Content>
  );
}
