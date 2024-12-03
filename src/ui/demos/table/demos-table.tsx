import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Status } from 'csdm/common/types/status';
import { LoadingDemosMessage } from 'csdm/ui/demos/table/loading-demos-message';
import { useDemosStatus } from '../use-demos-status';
import { Table } from 'csdm/ui/components/table/table';
import type { Demo } from 'csdm/common/types/demo';
import { useDemosTable } from './use-demos-table';
import { NoDemos } from './no-demos';
import { Message } from 'csdm/ui/components/message';
import { useFolders } from 'csdm/ui/settings/folders/use-folders';
import { CenteredContent } from 'csdm/ui/components/content';
import { AddFolderButton } from 'csdm/ui/settings/folders/add-folder-button';
import { useDemosState } from '../use-demos-state';

export function DemosTable() {
  const status = useDemosStatus();
  const { loadedDemoCount, demoToLoadCount } = useDemosState();
  const table = useDemosTable();
  const folders = useFolders();

  if (status === Status.Idle || status === Status.Loading || !table.isReady()) {
    return <LoadingDemosMessage loadedDemoCount={loadedDemoCount} demoToLoadCount={demoToLoadCount} />;
  }

  if (folders.length === 0) {
    return (
      <CenteredContent>
        <div className="flex flex-col gap-y-8">
          <Message message={<Trans>No folders found.</Trans>} />
          <div className="flex justify-center">
            <AddFolderButton />
          </div>
        </div>
      </CenteredContent>
    );
  }

  if (status === Status.Error) {
    return <Message message={<Trans>An error occurred.</Trans>} />;
  }

  if (table.getRowCount() === 0) {
    return <NoDemos />;
  }

  return <Table<Demo> table={table} />;
}
