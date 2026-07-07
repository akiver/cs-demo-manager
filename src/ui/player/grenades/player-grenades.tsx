import React, { useEffect, useState } from 'react';
import { Trans } from '@lingui/react/macro';
import type { PlayerFlashbangMatchup, PlayerGrenadesStats } from 'csdm/common/types/player-grenades-stats';
import { Status } from 'csdm/common/types/status';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { Content } from 'csdm/ui/components/content';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import { Message } from 'csdm/ui/components/message';
import { Panel, PanelRow, PanelTitle, PanelValue, PanelValueVariant } from 'csdm/ui/components/panel';
import { Spinner } from 'csdm/ui/components/spinner';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { usePlayerProfileSettings } from 'csdm/ui/settings/use-player-profile-settings';
import { useCurrentPlayerSteamId } from 'csdm/ui/player/use-current-player-steam-id';

type StatPanelProps = {
  title: React.ReactNode;
  value: React.ReactNode;
  subtitle: React.ReactNode;
};

function StatPanel({ title, value, subtitle }: StatPanelProps) {
  return (
    <Panel header={<PanelTitle>{title}</PanelTitle>} minWidth={180}>
      <div className="flex flex-col gap-y-4">
        <PanelValue variant={PanelValueVariant.Big}>{value}</PanelValue>
        <p className="text-gray-700">{subtitle}</p>
      </div>
    </Panel>
  );
}

type MatchupRowProps = {
  matchup: PlayerFlashbangMatchup;
};

function MatchupRow({ matchup }: MatchupRowProps) {
  const { averageDuration, flashedCount, flashedName, flashedSteamId, totalDuration } = matchup;

  return (
    <PanelRow>
      <div className="min-w-0">
        <p className="selectable truncate" title={flashedName}>
          {flashedName}
        </p>
        <p className="text-caption text-gray-700">{flashedSteamId}</p>
      </div>
      <div className="flex gap-x-16">
        <PanelValue>{flashedCount}</PanelValue>
        <PanelValue>
          <Trans context="Seconds">{totalDuration}s</Trans>
        </PanelValue>
        <PanelValue>
          <Trans context="Seconds">{averageDuration}s</Trans>
        </PanelValue>
      </div>
    </PanelRow>
  );
}

function FlashbangMatchups({ matchups }: { matchups: PlayerFlashbangMatchup[] }) {
  return (
    <Panel
      header={
        <div className="flex items-center justify-between gap-x-16">
          <PanelTitle>
            <Trans>Flashbang matchups</Trans>
          </PanelTitle>
          <div className="flex gap-x-16 text-caption text-gray-700">
            <span>
              <Trans>Count</Trans>
            </span>
            <span>
              <Trans>Total</Trans>
            </span>
            <span>
              <Trans>Avg</Trans>
            </span>
          </div>
        </div>
      }
    >
      {matchups.length === 0 ? (
        <Message message={<Trans>No flashbang matchup found for the current filters.</Trans>} />
      ) : (
        <div className="flex flex-col gap-y-8">
          {matchups.map((matchup) => {
            return <MatchupRow key={matchup.flashedSteamId} matchup={matchup} />;
          })}
        </div>
      )}
    </Panel>
  );
}

function GrenadesContent({ stats }: { stats: PlayerGrenadesStats }) {
  const { summary } = stats;
  const {
    averageEnemyBlindDuration,
    averageFireDamagePerMatch,
    averageFireGrenadesThrownPerMatch,
    averageFlashbangsThrownPerMatch,
    averageFlashbangsThrownPerRound,
    averageFlashedEnemiesPerMatch,
    averageHeDamagePerMatch,
    averageHeGrenadesThrownPerMatch,
    averageSmokeGrenadesThrownPerMatch,
    fireDamage,
    fireGrenadesThrownCount,
    flashbangsThrownCount,
    flashedEnemyCount,
    heDamage,
    heGrenadesThrownCount,
    heKillCount,
    matchCount,
    roundCount,
    smokeGrenadesThrownCount,
    totalEnemyBlindDuration,
  } = summary;
  const hasData =
    flashbangsThrownCount > 0 ||
    heGrenadesThrownCount > 0 ||
    smokeGrenadesThrownCount > 0 ||
    fireGrenadesThrownCount > 0 ||
    flashedEnemyCount > 0 ||
    heDamage > 0 ||
    fireDamage > 0;

  if (!hasData) {
    return <Message message={<Trans>No grenade stats found for the current filters.</Trans>} />;
  }

  return (
    <Content>
      <div className="flex flex-col gap-y-12">
        <div className="flex flex-wrap gap-8">
          <StatPanel
            title={<Trans>Flashbangs / match</Trans>}
            value={averageFlashbangsThrownPerMatch}
            subtitle={<Trans>{flashbangsThrownCount} thrown total</Trans>}
          />
          <StatPanel
            title={<Trans>Enemies flashed / match</Trans>}
            value={averageFlashedEnemiesPerMatch}
            subtitle={<Trans>{flashedEnemyCount} enemies flashed</Trans>}
          />
          <StatPanel
            title={<Trans>Avg blind time</Trans>}
            value={<Trans context="Seconds">{averageEnemyBlindDuration}s</Trans>}
            subtitle={<Trans>{totalEnemyBlindDuration}s total blind time</Trans>}
          />
          <StatPanel
            title={<Trans>HE damage / match</Trans>}
            value={averageHeDamagePerMatch}
            subtitle={<Trans>{heDamage} total damage</Trans>}
          />
          <StatPanel
            title={<Trans>Fire damage / match</Trans>}
            value={averageFireDamagePerMatch}
            subtitle={<Trans>{fireDamage} total damage</Trans>}
          />
          <StatPanel
            title={<Trans>Smokes / match</Trans>}
            value={averageSmokeGrenadesThrownPerMatch}
            subtitle={<Trans>{smokeGrenadesThrownCount} thrown total</Trans>}
          />
        </div>
        <Panel
          header={
            <PanelTitle>
              <Trans>Grenade averages</Trans>
            </PanelTitle>
          }
        >
          <div className="grid gap-y-8">
            <PanelRow>
              <p>
                <Trans>HE grenades / match</Trans>
              </p>
              <PanelValue>{averageHeGrenadesThrownPerMatch}</PanelValue>
            </PanelRow>
            <PanelRow>
              <p>
                <Trans>Fire grenades / match</Trans>
              </p>
              <PanelValue>{averageFireGrenadesThrownPerMatch}</PanelValue>
            </PanelRow>
            <PanelRow>
              <p>
                <Trans>Flashbangs / round</Trans>
              </p>
              <PanelValue>{averageFlashbangsThrownPerRound}</PanelValue>
            </PanelRow>
            <PanelRow>
              <p>
                <Trans>HE kills</Trans>
              </p>
              <PanelValue>{heKillCount}</PanelValue>
            </PanelRow>
            <PanelRow>
              <p>
                <Trans>Matches / rounds</Trans>
              </p>
              <PanelValue>
                <Trans>
                  {matchCount} matches, {roundCount} rounds
                </Trans>
              </PanelValue>
            </PanelRow>
          </div>
        </Panel>
        <FlashbangMatchups matchups={stats.flashbangMatchups} />
      </div>
    </Content>
  );
}

export function PlayerGrenades() {
  const client = useWebSocketClient();
  const steamId = useCurrentPlayerSteamId();
  const { demoSources, games, demoTypes, ranking, gameModes, tagIds, maxRounds, startDate, endDate } =
    usePlayerProfileSettings();
  const [status, setStatus] = useState<Status>(Status.Loading);
  const [stats, setStats] = useState<PlayerGrenadesStats | undefined>();

  useEffect(() => {
    let ignore = false;

    const fetchStats = async () => {
      try {
        setStatus(Status.Loading);
        const stats = await client.send({
          name: RendererClientMessageName.FetchPlayerGrenadesStats,
          payload: {
            steamId,
            startDate,
            endDate,
            demoSources,
            games,
            demoTypes,
            ranking,
            gameModes,
            tagIds,
            maxRounds,
          },
        });

        if (!ignore) {
          setStats(stats);
          setStatus(Status.Success);
        }
      } catch (error) {
        if (!ignore) {
          setStatus(Status.Error);
        }
      }
    };

    void fetchStats();

    return () => {
      ignore = true;
    };
  }, [client, demoSources, demoTypes, endDate, gameModes, games, maxRounds, ranking, startDate, steamId, tagIds]);

  if (status === Status.Loading) {
    return (
      <Content>
        <div className="flex flex-1 items-center justify-center">
          <Spinner size={42} />
        </div>
      </Content>
    );
  }

  if (status === Status.Error || stats === undefined) {
    return (
      <Content>
        <div className="flex flex-1 items-center justify-center">
          <ErrorMessage message={<Trans>An error occurred</Trans>} />
        </div>
      </Content>
    );
  }

  return <GrenadesContent stats={stats} />;
}
