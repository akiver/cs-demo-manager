import React, { useEffect, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { PlayerFlashbangMatchup, PlayerGrenadesStats } from 'csdm/common/types/player-grenades-stats';
import { Status } from 'csdm/common/types/status';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { Content } from 'csdm/ui/components/content';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import { Message } from 'csdm/ui/components/message';
import { Panel, PanelTitle, PanelValue, PanelValueVariant } from 'csdm/ui/components/panel';
import { Spinner } from 'csdm/ui/components/spinner';
import { Table } from 'csdm/ui/components/table/table';
import type { CellProps, Column } from 'csdm/ui/components/table/table-types';
import { useTable } from 'csdm/ui/components/table/use-table';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { TableName } from 'csdm/node/settings/table/table-name';
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

type GrenadeAverageRow = {
  id: string;
  name: string;
  thrownCount: number;
  averagePerMatch: number;
  averagePerRound: number;
  enemyImpactPerMatch: number;
  teammateImpactPerMatch: number;
  enemyImpactReceivedPerMatch: number;
  teammateImpactReceivedPerMatch: number;
  hasImpactStats: boolean;
  enemyKillCount: number;
  hasEnemyKillCount: boolean;
};

function getGrenadeAverageRowId(row: GrenadeAverageRow) {
  return row.id;
}

function EnemyKillCountCell({ data }: CellProps<GrenadeAverageRow>) {
  return <>{data.hasEnemyKillCount ? data.enemyKillCount : '-'}</>;
}

function EnemyImpactPerMatchCell({ data }: CellProps<GrenadeAverageRow>) {
  return <>{data.hasImpactStats ? data.enemyImpactPerMatch : '-'}</>;
}

function TeammateImpactPerMatchCell({ data }: CellProps<GrenadeAverageRow>) {
  return <>{data.hasImpactStats ? data.teammateImpactPerMatch : '-'}</>;
}

function EnemyImpactReceivedPerMatchCell({ data }: CellProps<GrenadeAverageRow>) {
  return <>{data.hasImpactStats ? data.enemyImpactReceivedPerMatch : '-'}</>;
}

function TeammateImpactReceivedPerMatchCell({ data }: CellProps<GrenadeAverageRow>) {
  return <>{data.hasImpactStats ? data.teammateImpactReceivedPerMatch : '-'}</>;
}

function GrenadeAveragesTable({ summary }: { summary: PlayerGrenadesStats['summary'] }) {
  const { t } = useLingui();
  const columns: readonly Column<GrenadeAverageRow>[] = [
    {
      id: 'grenade',
      accessor: 'name',
      headerText: t({
        context: 'Table header',
        message: 'Grenade',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Grenade',
      }),
      width: 170,
      maxWidth: 300,
    },
    {
      id: 'thrown',
      accessor: 'thrownCount',
      headerText: t({
        context: 'Table header',
        message: 'Thrown',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Thrown by this player',
      }),
      width: 80,
      maxWidth: 140,
      textAlign: 'right',
    },
    {
      id: 'average-per-match',
      accessor: 'averagePerMatch',
      headerText: t({
        context: 'Table header',
        message: 'Avg / match',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Average thrown per match',
      }),
      width: 100,
      maxWidth: 160,
      textAlign: 'right',
    },
    {
      id: 'average-per-round',
      accessor: 'averagePerRound',
      headerText: t({
        context: 'Table header',
        message: 'Avg / round',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Average thrown per round',
      }),
      width: 100,
      maxWidth: 160,
      textAlign: 'right',
    },
    {
      id: 'enemy-impact-per-match',
      accessor: 'enemyImpactPerMatch',
      headerText: t({
        context: 'Table header',
        message: 'Enemy impact / match',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Flash count for flashbangs, damage for HE and fire grenades',
      }),
      width: 140,
      maxWidth: 220,
      textAlign: 'right',
      Cell: EnemyImpactPerMatchCell,
    },
    {
      id: 'teammate-impact-per-match',
      accessor: 'teammateImpactPerMatch',
      headerText: t({
        context: 'Table header',
        message: 'Teammate impact / match',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Flash count for flashbangs, damage for HE and fire grenades',
      }),
      width: 150,
      maxWidth: 230,
      textAlign: 'right',
      Cell: TeammateImpactPerMatchCell,
    },
    {
      id: 'enemy-impact-received-per-match',
      accessor: 'enemyImpactReceivedPerMatch',
      headerText: t({
        context: 'Table header',
        message: 'Enemy impact received / match',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Flash count for flashbangs, damage for HE and fire grenades',
      }),
      width: 170,
      maxWidth: 250,
      textAlign: 'right',
      Cell: EnemyImpactReceivedPerMatchCell,
    },
    {
      id: 'teammate-impact-received-per-match',
      accessor: 'teammateImpactReceivedPerMatch',
      headerText: t({
        context: 'Table header',
        message: 'Teammate impact received / match',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Flash count for flashbangs, damage for HE and fire grenades',
      }),
      width: 180,
      maxWidth: 260,
      textAlign: 'right',
      Cell: TeammateImpactReceivedPerMatchCell,
    },
    {
      id: 'kills',
      accessor: 'enemyKillCount',
      headerText: t({
        context: 'Table header',
        message: 'Kills',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Enemy kills',
      }),
      width: 70,
      maxWidth: 120,
      textAlign: 'right',
      Cell: EnemyKillCountCell,
    },
  ];
  const rows: GrenadeAverageRow[] = [
    {
      id: 'flashbang',
      name: t({
        message: 'Flashbang',
      }),
      thrownCount: summary.flashbangsThrownCount,
      averagePerMatch: summary.averageFlashbangsThrownPerMatch,
      averagePerRound: summary.averageFlashbangsThrownPerRound,
      enemyImpactPerMatch: summary.averageFlashedEnemiesPerMatch,
      teammateImpactPerMatch: summary.averageFlashedTeammatesPerMatch,
      enemyImpactReceivedPerMatch: summary.averageFlashedByEnemiesPerMatch,
      teammateImpactReceivedPerMatch: summary.averageFlashedByTeammatesPerMatch,
      hasImpactStats: true,
      enemyKillCount: 0,
      hasEnemyKillCount: false,
    },
    {
      id: 'he',
      name: t({
        message: 'HE grenade',
      }),
      thrownCount: summary.heGrenadesThrownCount,
      averagePerMatch: summary.averageHeGrenadesThrownPerMatch,
      averagePerRound: summary.averageHeGrenadesThrownPerRound,
      enemyImpactPerMatch: summary.averageHeDamagePerMatch,
      teammateImpactPerMatch: summary.averageHeTeammateDamagePerMatch,
      enemyImpactReceivedPerMatch: summary.averageHeDamageTakenFromEnemiesPerMatch,
      teammateImpactReceivedPerMatch: summary.averageHeDamageTakenFromTeammatesPerMatch,
      hasImpactStats: true,
      enemyKillCount: summary.heKillCount,
      hasEnemyKillCount: true,
    },
    {
      id: 'fire',
      name: t({
        message: 'Molotov / Incendiary',
      }),
      thrownCount: summary.fireGrenadesThrownCount,
      averagePerMatch: summary.averageFireGrenadesThrownPerMatch,
      averagePerRound: summary.averageFireGrenadesThrownPerRound,
      enemyImpactPerMatch: summary.averageFireDamagePerMatch,
      teammateImpactPerMatch: summary.averageFireTeammateDamagePerMatch,
      enemyImpactReceivedPerMatch: summary.averageFireDamageTakenFromEnemiesPerMatch,
      teammateImpactReceivedPerMatch: summary.averageFireDamageTakenFromTeammatesPerMatch,
      hasImpactStats: true,
      enemyKillCount: 0,
      hasEnemyKillCount: false,
    },
    {
      id: 'smoke',
      name: t({
        message: 'Smoke grenade',
      }),
      thrownCount: summary.smokeGrenadesThrownCount,
      averagePerMatch: summary.averageSmokeGrenadesThrownPerMatch,
      averagePerRound: summary.averageSmokeGrenadesThrownPerRound,
      enemyImpactPerMatch: 0,
      teammateImpactPerMatch: 0,
      enemyImpactReceivedPerMatch: 0,
      teammateImpactReceivedPerMatch: 0,
      hasImpactStats: false,
      enemyKillCount: 0,
      hasEnemyKillCount: false,
    },
  ];
  const table = useTable({
    columns,
    data: rows,
    fixedColumnsWidth: true,
    getRowId: getGrenadeAverageRowId,
    persistStateKey: TableName.PlayerGrenadeAverages,
    rowSelection: 'none',
    sortedColumn: { id: 'grenade', direction: 'asc' },
  });

  return (
    <Panel
      header={
        <PanelTitle>
          <Trans>Grenade averages</Trans>
        </PanelTitle>
      }
    >
      <Table<GrenadeAverageRow> table={table} />
    </Panel>
  );
}

function getFlashbangMatchupRowId(row: PlayerFlashbangMatchup) {
  return `${row.relation}-${row.steamId}`;
}

function TotalBlindTimeCell({ data }: CellProps<PlayerFlashbangMatchup>) {
  const { totalDuration } = data;

  return <Trans context="Seconds">{totalDuration}s</Trans>;
}

function AverageBlindTimeCell({ data }: CellProps<PlayerFlashbangMatchup>) {
  const { averageDuration } = data;

  return <Trans context="Seconds">{averageDuration}s</Trans>;
}

function RelationCell({ data }: CellProps<PlayerFlashbangMatchup>) {
  if (data.relation === 'enemy') {
    return (
      <span className="text-red-700">
        <Trans>Enemy</Trans>
      </span>
    );
  }

  return (
    <span className="text-green-700">
      <Trans>Teammate</Trans>
    </span>
  );
}

type FlashbangMatchupsTableProps = {
  title: React.ReactNode;
  description: React.ReactNode;
  emptyMessage: React.ReactNode;
  matchups: PlayerFlashbangMatchup[];
  tableName: TableName;
};

function FlashbangMatchupsTable({
  description,
  emptyMessage,
  matchups,
  tableName,
  title,
}: FlashbangMatchupsTableProps) {
  const { t } = useLingui();
  const columns: readonly Column<PlayerFlashbangMatchup>[] = [
    {
      id: 'player',
      accessor: 'name',
      headerText: t({
        context: 'Table header',
        message: 'Player',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Player',
      }),
      width: 200,
      maxWidth: 400,
    },
    {
      id: 'relation',
      accessor: 'relation',
      headerText: t({
        context: 'Table header',
        message: 'Relation',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Player relation',
      }),
      width: 100,
      maxWidth: 160,
      Cell: RelationCell,
    },
    {
      id: 'steam-id',
      accessor: 'steamId',
      headerText: t({
        context: 'Table header',
        message: 'Steam ID',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Steam ID',
      }),
      width: 170,
      maxWidth: 250,
    },
    {
      id: 'flashes',
      accessor: 'count',
      headerText: t({
        context: 'Table header',
        message: 'Flashes',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Flashbang count',
      }),
      width: 90,
      maxWidth: 150,
      textAlign: 'right',
    },
    {
      id: 'total-blind-time',
      accessor: 'totalDuration',
      headerText: t({
        context: 'Table header',
        message: 'Total blind time',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Total blind time',
      }),
      width: 130,
      maxWidth: 200,
      textAlign: 'right',
      Cell: TotalBlindTimeCell,
    },
    {
      id: 'average-blind-time',
      accessor: 'averageDuration',
      headerText: t({
        context: 'Table header',
        message: 'Avg blind time',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Average blind time',
      }),
      width: 130,
      maxWidth: 200,
      textAlign: 'right',
      Cell: AverageBlindTimeCell,
    },
  ];
  const table = useTable({
    columns,
    data: matchups,
    fixedColumnsWidth: true,
    getRowId: getFlashbangMatchupRowId,
    persistStateKey: tableName,
    rowSelection: 'none',
    sortedColumn: { id: 'total-blind-time', direction: 'desc' },
  });

  return (
    <Panel
      header={
        <div className="flex flex-col gap-y-4">
          <PanelTitle>{title}</PanelTitle>
          <p className="text-caption text-gray-700">{description}</p>
        </div>
      }
    >
      {matchups.length === 0 ? <Message message={emptyMessage} /> : <Table<PlayerFlashbangMatchup> table={table} />}
    </Panel>
  );
}

function GrenadesContent({ stats }: { stats: PlayerGrenadesStats }) {
  const { summary } = stats;
  const {
    averageEnemyBlindDuration,
    averageFireDamagePerMatch,
    averageFlashbangsThrownPerMatch,
    averageFlashedByEnemiesPerMatch,
    averageFlashedByTeammatesPerMatch,
    averageFlashedEnemiesPerMatch,
    averageFlashedTeammatesPerMatch,
    averageHeDamagePerMatch,
    averageSmokeGrenadesThrownPerMatch,
    fireDamage,
    fireDamageTakenFromEnemies,
    fireDamageTakenFromTeammates,
    fireGrenadesThrownCount,
    fireTeammateDamage,
    flashbangsThrownCount,
    flashedByEnemyCount,
    flashedByTeammateCount,
    flashedEnemyCount,
    flashedTeammateCount,
    heDamage,
    heDamageTakenFromEnemies,
    heDamageTakenFromTeammates,
    heGrenadesThrownCount,
    heTeammateDamage,
    smokeGrenadesThrownCount,
    totalEnemyBlindDuration,
  } = summary;
  const hasData =
    flashbangsThrownCount > 0 ||
    heGrenadesThrownCount > 0 ||
    smokeGrenadesThrownCount > 0 ||
    fireGrenadesThrownCount > 0 ||
    flashedEnemyCount > 0 ||
    flashedTeammateCount > 0 ||
    flashedByEnemyCount > 0 ||
    flashedByTeammateCount > 0 ||
    heDamage > 0 ||
    heTeammateDamage > 0 ||
    heDamageTakenFromEnemies > 0 ||
    heDamageTakenFromTeammates > 0 ||
    fireDamage > 0 ||
    fireTeammateDamage > 0 ||
    fireDamageTakenFromEnemies > 0 ||
    fireDamageTakenFromTeammates > 0;

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
            title={<Trans>Teammates flashed / match</Trans>}
            value={averageFlashedTeammatesPerMatch}
            subtitle={<Trans>Teammates flashed by this player: {flashedTeammateCount}</Trans>}
          />
          <StatPanel
            title={<Trans>Flashed by enemies / match</Trans>}
            value={averageFlashedByEnemiesPerMatch}
            subtitle={<Trans>Times this player was flashed by enemies: {flashedByEnemyCount}</Trans>}
          />
          <StatPanel
            title={<Trans>Flashed by teammates / match</Trans>}
            value={averageFlashedByTeammatesPerMatch}
            subtitle={<Trans>Times this player was flashed by teammates: {flashedByTeammateCount}</Trans>}
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
          description={<Trans>Enemy and teammate players flashed by this player.</Trans>}
          emptyMessage={<Trans>No player was flashed by this player for the current filters.</Trans>}
          matchups={stats.flashedPlayers}
          tableName={TableName.PlayerGrenadesFlashedPlayers}
        />
        <FlashbangMatchupsTable
          title={<Trans>Players who flashed this player</Trans>}
          description={<Trans>Enemy and teammate players who flashed this player.</Trans>}
          emptyMessage={<Trans>No player flashed this player for the current filters.</Trans>}
          matchups={stats.flashedByPlayers}
          tableName={TableName.PlayerGrenadesFlashedByPlayers}
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
