import React, { useEffect, useState } from 'react';
import { Trans } from '@lingui/react/macro';
import type { PlayerFlashbangMatchup, PlayerGrenadesStats } from 'csdm/common/types/player-grenades-stats';
import { Status } from 'csdm/common/types/status';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { Content } from 'csdm/ui/components/content';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import { Message } from 'csdm/ui/components/message';
import { Panel, PanelTitle, PanelValue, PanelValueVariant } from 'csdm/ui/components/panel';
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

type TextAlign = 'left' | 'right';

type TableCellProps = {
  children: React.ReactNode;
  textAlign?: TextAlign;
  title?: string;
};

function HeaderCell({ children, textAlign = 'left' }: TableCellProps) {
  const textAlignClassName = textAlign === 'right' ? 'text-right' : 'text-left';

  return (
    <th className="h-32 border-y border-r border-gray-300 bg-gray-50 px-8 last:border-r-0" scope="col">
      <span className={`block truncate text-body-strong ${textAlignClassName}`}>{children}</span>
    </th>
  );
}

function BodyCell({ children, textAlign = 'left', title }: TableCellProps) {
  const textAlignClassName = textAlign === 'right' ? 'text-right' : 'text-left';

  return (
    <td
      className={`max-w-0 selectable truncate overflow-hidden border-r border-b border-gray-300 px-8 py-4 last:border-r-0 ${textAlignClassName}`}
      title={title}
    >
      {children}
    </td>
  );
}

type GrenadeAverageRow = {
  id: string;
  name: React.ReactNode;
  thrownCount: number;
  averagePerMatch: number;
  averagePerRound: number;
  enemyDamage: React.ReactNode;
  enemyDamagePerThrow: React.ReactNode;
  enemyKillCount: React.ReactNode;
};

function GrenadeAveragesTable({ summary }: { summary: PlayerGrenadesStats['summary'] }) {
  const rows: GrenadeAverageRow[] = [
    {
      id: 'flashbang',
      name: <Trans>Flashbang</Trans>,
      thrownCount: summary.flashbangsThrownCount,
      averagePerMatch: summary.averageFlashbangsThrownPerMatch,
      averagePerRound: summary.averageFlashbangsThrownPerRound,
      enemyDamage: '-',
      enemyDamagePerThrow: '-',
      enemyKillCount: '-',
    },
    {
      id: 'he',
      name: <Trans>HE grenade</Trans>,
      thrownCount: summary.heGrenadesThrownCount,
      averagePerMatch: summary.averageHeGrenadesThrownPerMatch,
      averagePerRound: summary.averageHeGrenadesThrownPerRound,
      enemyDamage: summary.heDamage,
      enemyDamagePerThrow: summary.averageHeDamagePerThrow,
      enemyKillCount: summary.heKillCount,
    },
    {
      id: 'fire',
      name: <Trans>Molotov / Incendiary</Trans>,
      thrownCount: summary.fireGrenadesThrownCount,
      averagePerMatch: summary.averageFireGrenadesThrownPerMatch,
      averagePerRound: summary.averageFireGrenadesThrownPerRound,
      enemyDamage: summary.fireDamage,
      enemyDamagePerThrow: summary.averageFireDamagePerThrow,
      enemyKillCount: '-',
    },
    {
      id: 'smoke',
      name: <Trans>Smoke grenade</Trans>,
      thrownCount: summary.smokeGrenadesThrownCount,
      averagePerMatch: summary.averageSmokeGrenadesThrownPerMatch,
      averagePerRound: summary.averageSmokeGrenadesThrownPerRound,
      enemyDamage: '-',
      enemyDamagePerThrow: '-',
      enemyKillCount: '-',
    },
  ];

  return (
    <Panel
      header={
        <PanelTitle>
          <Trans>Grenade averages</Trans>
        </PanelTitle>
      }
    >
      <div className="overflow-auto">
        <table className="w-full table-fixed border-collapse border-spacing-0">
          <thead>
            <tr>
              <HeaderCell>
                <Trans>Grenade</Trans>
              </HeaderCell>
              <HeaderCell textAlign="right">
                <Trans>Thrown</Trans>
              </HeaderCell>
              <HeaderCell textAlign="right">
                <Trans>Avg / match</Trans>
              </HeaderCell>
              <HeaderCell textAlign="right">
                <Trans>Avg / round</Trans>
              </HeaderCell>
              <HeaderCell textAlign="right">
                <Trans>Enemy damage</Trans>
              </HeaderCell>
              <HeaderCell textAlign="right">
                <Trans>Damage / throw</Trans>
              </HeaderCell>
              <HeaderCell textAlign="right">
                <Trans>Kills</Trans>
              </HeaderCell>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              return (
                <tr className="h-32" key={row.id}>
                  <BodyCell>{row.name}</BodyCell>
                  <BodyCell textAlign="right">{row.thrownCount}</BodyCell>
                  <BodyCell textAlign="right">{row.averagePerMatch}</BodyCell>
                  <BodyCell textAlign="right">{row.averagePerRound}</BodyCell>
                  <BodyCell textAlign="right">{row.enemyDamage}</BodyCell>
                  <BodyCell textAlign="right">{row.enemyDamagePerThrow}</BodyCell>
                  <BodyCell textAlign="right">{row.enemyKillCount}</BodyCell>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

type FlashbangMatchupsTableProps = {
  title: React.ReactNode;
  description: React.ReactNode;
  emptyMessage: React.ReactNode;
  matchups: PlayerFlashbangMatchup[];
};

function FlashbangMatchupsTable({ description, emptyMessage, matchups, title }: FlashbangMatchupsTableProps) {
  return (
    <Panel
      header={
        <div className="flex flex-col gap-y-4">
          <PanelTitle>{title}</PanelTitle>
          <p className="text-caption text-gray-700">{description}</p>
        </div>
      }
    >
      {matchups.length === 0 ? (
        <Message message={emptyMessage} />
      ) : (
        <div className="overflow-auto">
          <table className="w-full table-fixed border-collapse border-spacing-0">
            <thead>
              <tr>
                <HeaderCell>
                  <Trans>Player</Trans>
                </HeaderCell>
                <HeaderCell textAlign="right">
                  <Trans>Flashes</Trans>
                </HeaderCell>
                <HeaderCell textAlign="right">
                  <Trans>Total blind time</Trans>
                </HeaderCell>
                <HeaderCell textAlign="right">
                  <Trans>Avg blind time</Trans>
                </HeaderCell>
              </tr>
            </thead>
            <tbody>
              {matchups.map((matchup) => {
                const { averageDuration, count, name, steamId, totalDuration } = matchup;

                return (
                  <tr className="h-48" key={steamId}>
                    <BodyCell title={name}>
                      <div className="min-w-0">
                        <p className="truncate">{name}</p>
                        <p className="truncate text-caption text-gray-700">{steamId}</p>
                      </div>
                    </BodyCell>
                    <BodyCell textAlign="right">{count}</BodyCell>
                    <BodyCell textAlign="right">
                      <Trans context="Seconds">{totalDuration}s</Trans>
                    </BodyCell>
                    <BodyCell textAlign="right">
                      <Trans context="Seconds">{averageDuration}s</Trans>
                    </BodyCell>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
    averageFlashbangsThrownPerMatch,
    averageFlashedEnemiesPerMatch,
    averageHeDamagePerMatch,
    averageSmokeGrenadesThrownPerMatch,
    fireDamage,
    fireGrenadesThrownCount,
    flashbangsThrownCount,
    flashedEnemyCount,
    heDamage,
    heGrenadesThrownCount,
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
            title={<Trans>Flashbangs thrown / match</Trans>}
            value={averageFlashbangsThrownPerMatch}
            subtitle={<Trans>Thrown by this player: {flashbangsThrownCount}</Trans>}
          />
          <StatPanel
            title={<Trans>Enemies flashed / match</Trans>}
            value={averageFlashedEnemiesPerMatch}
            subtitle={<Trans>Enemies flashed by this player: {flashedEnemyCount}</Trans>}
          />
          <StatPanel
            title={<Trans>Enemy blind time / flash</Trans>}
            value={<Trans context="Seconds">{averageEnemyBlindDuration}s</Trans>}
            subtitle={<Trans>Total enemy blind time caused: {totalEnemyBlindDuration}s</Trans>}
          />
          <StatPanel
            title={<Trans>Enemy HE damage / match</Trans>}
            value={averageHeDamagePerMatch}
            subtitle={<Trans>Damage dealt to enemies: {heDamage}</Trans>}
          />
          <StatPanel
            title={<Trans>Enemy fire damage / match</Trans>}
            value={averageFireDamagePerMatch}
            subtitle={<Trans>Damage dealt to enemies: {fireDamage}</Trans>}
          />
          <StatPanel
            title={<Trans>Smokes thrown / match</Trans>}
            value={averageSmokeGrenadesThrownPerMatch}
            subtitle={<Trans>Thrown by this player: {smokeGrenadesThrownCount}</Trans>}
          />
        </div>
        <GrenadeAveragesTable summary={summary} />
        <FlashbangMatchupsTable
          title={<Trans>Players flashed by this player</Trans>}
          description={<Trans>Enemy players flashed by this player only.</Trans>}
          emptyMessage={<Trans>No enemy player was flashed by this player for the current filters.</Trans>}
          matchups={stats.flashedPlayers}
        />
        <FlashbangMatchupsTable
          title={<Trans>Players who flashed this player</Trans>}
          description={<Trans>Enemy players who flashed this player only.</Trans>}
          emptyMessage={<Trans>No enemy player flashed this player for the current filters.</Trans>}
          matchups={stats.flashedByPlayers}
        />
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
