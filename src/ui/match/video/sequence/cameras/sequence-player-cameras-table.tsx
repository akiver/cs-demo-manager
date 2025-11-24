import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useTable } from 'csdm/ui/components/table/use-table';
import { Table } from 'csdm/ui/components/table/table';
import type { Column } from 'csdm/ui/components/table/table-types';
import type { PlayerCameraFocus } from 'csdm/common/types/player-camera-focus';
import type { CellProps } from 'csdm/ui/components/table/table-types';
import { Button } from 'csdm/ui/components/buttons/button';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';
import { Select, type SelectOption } from 'csdm/ui/components/inputs/select';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { useSequenceForm } from 'csdm/ui/match/video/sequence/use-sequence-form';
import { ManageCamerasButtons } from './manage-player-cameras-buttons';

function TickCell({ data }: CellProps<PlayerCameraFocus>) {
  const { setCameraOnPlayerAtTick } = useSequenceForm();

  return (
    <InputNumber
      defaultValue={data.tick}
      onBlur={(event) => {
        const newTick = Number.parseInt(event.target.value);
        if (Number.isNaN(newTick) || newTick === data.tick) {
          return;
        }

        setCameraOnPlayerAtTick({
          tick: newTick,
          playerSteamId: data.playerSteamId,
          oldTick: data.tick,
        });
      }}
    />
  );
}

function PlayerNameCell({ rowIndex, data }: CellProps<PlayerCameraFocus>) {
  const match = useCurrentMatch();
  const { sequence, setCameraOnPlayerAtTick } = useSequenceForm();
  const options: SelectOption[] = match.players
    .toSorted((playerA, playerB) => {
      return playerA.name.localeCompare(playerB.name);
    })
    .map((player) => {
      return {
        value: player.steamId,
        label: player.name,
      };
    });
  const isDisabled = options.length === 0;

  return (
    <Select
      options={options}
      isDisabled={isDisabled}
      value={data.playerSteamId}
      onChange={(steamId: string) => {
        const currentCamera = sequence.playerCameras[rowIndex];
        if (!currentCamera) {
          return;
        }
        setCameraOnPlayerAtTick({
          tick: data.tick,
          playerSteamId: steamId,
          oldTick: currentCamera.tick,
        });
      }}
    />
  );
}

function ActionsCell({ data }: CellProps<PlayerCameraFocus>) {
  const { removeCameraAtTick } = useSequenceForm();

  return (
    <Button
      onClick={() => {
        removeCameraAtTick(data.tick);
      }}
    >
      <Trans context="Button">Remove</Trans>
    </Button>
  );
}

function getRowId(row: PlayerCameraFocus) {
  return `${row.tick}-${row.playerSteamId}`;
}

export function SequencePlayerCamerasTable() {
  const sequenceContext = useSequenceForm();
  const { sequence } = sequenceContext;
  const { t } = useLingui();

  const columns: readonly Column<PlayerCameraFocus>[] = [
    {
      id: 'tick',
      accessor: 'tick',
      headerText: t({
        context: 'Table header',
        message: 'Tick',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Tick',
      }),
      width: 130,
      Cell: TickCell,
      allowSort: false,
      allowResize: false,
      sortFunction: () => {
        return (cameraA, cameraB) => {
          return cameraA.tick - cameraB.tick;
        };
      },
    },
    {
      id: 'player-name',
      accessor: 'playerName',
      headerText: t({
        context: 'Table header',
        message: 'Player',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Player',
      }),
      width: 200,
      Cell: PlayerNameCell,
      allowSort: false,
      allowMove: false,
    },
    {
      id: 'actions',
      accessor: 'playerSteamId',
      headerText: t({
        context: 'Table header',
        message: 'Actions',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Actions',
      }),
      width: 130,
      Cell: ActionsCell,
      allowSort: false,
      allowResize: false,
      allowMove: false,
    },
  ];

  const table = useTable({
    columns,
    data: sequence.playerCameras,
    getRowId,
    rowSelection: 'none',
    sortedColumn: { id: 'tick', direction: 'desc' },
  });
  const cameraCount = sequence.playerCameras.length;

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2>
          <Trans>
            Player cameras (<strong>{cameraCount}</strong>)
          </Trans>
        </h2>

        <ManageCamerasButtons />
      </div>
      <Table<PlayerCameraFocus> table={table} />
    </div>
  );
}
