import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useTable } from 'csdm/ui/components/table/use-table';
import { Table } from 'csdm/ui/components/table/table';
import type { Column } from 'csdm/ui/components/table/table-types';
import type { CellProps } from 'csdm/ui/components/table/table-types';
import { Button } from 'csdm/ui/components/buttons/button';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';
import { useSequenceForm } from 'csdm/ui/match/video/sequence/use-sequence-form';
import type { CustomCameraFocus } from 'csdm/common/types/custom-camera-focus';
import { ManageCustomCamerasButtons } from './manage-custom-cameras-buttons';

function TickCell({ data }: CellProps<CustomCameraFocus>) {
  const { setCameraAtTick } = useSequenceForm();

  return (
    <InputNumber
      defaultValue={data.tick}
      onBlur={(event) => {
        const newTick = Number.parseInt(event.target.value);
        if (Number.isNaN(newTick) || newTick === data.tick) {
          return;
        }

        setCameraAtTick({
          tick: newTick,
          cameraId: data.id,
          oldTick: data.tick,
        });
      }}
    />
  );
}

function NameCell({ data }: CellProps<CustomCameraFocus>) {
  return (
    <div className="flex items-center gap-x-8">
      <div className="size-8 shrink-0 rounded-full" style={{ backgroundColor: data.color }}></div>
      <p className="truncate" title={data.name}>
        {data.name}
      </p>
    </div>
  );
}

function ActionsCell({ data }: CellProps<CustomCameraFocus>) {
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

function getRowId(row: CustomCameraFocus) {
  return `${row.tick}-${row.id}`;
}

export function SequenceCustomCamerasTable() {
  const { sequence } = useSequenceForm();
  const { t } = useLingui();

  const columns: readonly Column<CustomCameraFocus>[] = [
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
      id: 'camera-name',
      accessor: 'name',
      Cell: NameCell,
      headerText: t({
        context: 'Table header',
        message: 'Name',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Name',
      }),
      width: 200,
      allowSort: false,
      allowMove: false,
    },
    {
      id: 'actions',
      accessor: 'id',
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
    data: sequence.cameras,
    getRowId,
    rowSelection: 'none',
    sortedColumn: { id: 'tick', direction: 'desc' },
  });
  const cameraCount = sequence.cameras.length;

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2>
          <Trans>
            Custom cameras (<strong>{cameraCount}</strong>)
          </Trans>
        </h2>
        <ManageCustomCamerasButtons />
      </div>
      <Table<CustomCameraFocus> table={table} />
    </div>
  );
}
