import React, { useState, type ReactNode } from 'react';
import { Plural, Trans, useLingui } from '@lingui/react/macro';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import type { OpenDialogOptions } from 'electron';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { useFolders } from '../folders/use-folders';
import { ErrorCode } from 'csdm/common/error-code';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';
import { SpinnableButton } from 'csdm/ui/components/buttons/spinnable-button';
import type { ImportV2BackupResult } from 'csdm/node/database/database/import-data-from-v2-backup';
import { CloseButton } from 'csdm/ui/components/buttons/close-button';

function PathList({ paths }: { paths: string[] }) {
  return (
    <ul className="border border-gray-300 rounded-4 max-h-[200px] overflow-auto">
      {paths.map((path) => {
        return (
          <li key={path} className="px-8 py-4 selectable font-bold whitespace-nowrap">
            {path}
          </li>
        );
      })}
    </ul>
  );
}

function ImportV2DataDialog() {
  const client = useWebSocketClient();
  const { t } = useLingui();
  const [error, setError] = useState<ReactNode>(null);
  const [backupFilePath, setBackupFilePath] = useState<string>('');
  const [isBusy, setIsBusy] = useState(false);
  const [importComments, setImportComments] = useState(true);
  const [importStatuses, setImportStatuses] = useState(true);
  const [result, setResult] = useState<ImportV2BackupResult | null>(null);
  const { hideDialog } = useDialog();
  const folders = useFolders();

  const onSelectBackupFileClick = async () => {
    const options: OpenDialogOptions = {
      properties: ['openFile'],
      filters: [{ extensions: ['json'], name: t`JSON file` }],
    };
    const { canceled, filePaths } = await window.csdm.showOpenDialog(options);
    if (canceled || filePaths.length === 0) {
      return;
    }
    setBackupFilePath(filePaths[0]);
  };

  const onImportClick = async () => {
    try {
      if (isBusy) {
        return;
      }
      if (!importComments && !importStatuses) {
        return setError(<Trans>You must select at least one data to import.</Trans>);
      }
      if (backupFilePath === '') {
        return setError(<Trans>You must select a CS:DM V2 backup file.</Trans>);
      }
      if (folders.length === 0) {
        return setError(<Trans>You need at least one folder.</Trans>);
      }

      setError(null);
      setIsBusy(true);
      const result = await client.send({
        name: RendererClientMessageName.ImportDataFromV2Backup,
        payload: {
          backupFilePath,
          importComments,
          importStatuses,
        },
      });
      setResult(result);
    } catch (error) {
      let errorMessage: ReactNode;
      switch (error) {
        case ErrorCode.InvalidBackupFile:
          errorMessage = <Trans>The backup file is invalid.</Trans>;
          break;
        case ErrorCode.TagNotFound:
          errorMessage = <Trans>A required tag has not been found.</Trans>;
          break;
        default:
          errorMessage = <Trans>An error occurred.</Trans>;
      }
      setError(errorMessage);
    } finally {
      setIsBusy(false);
    }
  };

  const renderForm = () => {
    return (
      <>
        <div className="flex flex-col gap-y-4">
          <p>
            <Trans>Select the JSON backup file generated from the CS:DM V2.</Trans>
          </p>
          <div>
            <Button onClick={onSelectBackupFileClick} variant={ButtonVariant.Primary}>
              <Trans context="Button">Select backup file</Trans>
            </Button>
          </div>
          {backupFilePath !== '' && (
            <div className="border border-gray-300 rounded-4">
              <p className="px-8 py-4 selectable font-bold">{backupFilePath}</p>
            </div>
          )}
        </div>

        <div>
          <Checkbox
            label={<Trans>Import comments</Trans>}
            isChecked={importComments}
            onChange={(event) => {
              setImportComments(event.target.checked);
            }}
          />
          <Checkbox
            label={<Trans>Import statuses</Trans>}
            isChecked={importStatuses}
            onChange={(event) => {
              setImportStatuses(event.target.checked);
            }}
          />
        </div>

        <div className="flex flex-col gap-4">
          <p>
            <Trans>The comment and status of the demos inside the following folders will be updated:</Trans>
          </p>
          {folders.length > 0 ? (
            <PathList paths={folders.map((folder) => folder.path)} />
          ) : (
            <ErrorMessage message={<Trans>No folders found.</Trans>} />
          )}
        </div>
        {error && (
          <div className="mt-8">
            <ErrorMessage message={error} />
          </div>
        )}
      </>
    );
  };

  const renderResult = ({ demoFoundCount, demoToImportCount, updatedDemoPaths }: ImportV2BackupResult) => {
    const updatedDemoCount = updatedDemoPaths.length;

    return (
      <>
        <p>
          <Plural
            value={demoToImportCount}
            one={
              <Trans>
                <strong>#</strong> demo to import found in the backup file.
              </Trans>
            }
            other={
              <Trans>
                <strong>#</strong> demos to import found in the backup file.
              </Trans>
            }
          />
        </p>
        <p>
          <Plural
            value={demoToImportCount}
            one={
              <Trans>
                <strong>{demoFoundCount}</strong> demo found in folders.
              </Trans>
            }
            other={
              <Trans>
                <strong>{demoFoundCount}</strong> demos found in folders.
              </Trans>
            }
          />
        </p>
        {updatedDemoCount > 0 && (
          <div>
            <p>
              <Plural
                value={demoToImportCount}
                one={
                  <Trans>
                    <strong>{updatedDemoCount}</strong> demo updated:
                  </Trans>
                }
                other={
                  <Trans>
                    <strong>{updatedDemoCount}</strong> demos updated:
                  </Trans>
                }
              />
            </p>
            <PathList paths={updatedDemoPaths} />
          </div>
        )}
      </>
    );
  };

  return (
    <Dialog closeOnBackgroundClicked={!isBusy} closeOnEscPressed={!isBusy}>
      <DialogHeader>
        <DialogTitle>
          <Trans context="Dialog title">Import CS:DM V2</Trans>
        </DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="flex flex-col gap-y-8 w-[620px]">{result ? renderResult(result) : renderForm()}</div>
      </DialogContent>
      <DialogFooter>
        {result === null && (
          <SpinnableButton onClick={onImportClick} variant={ButtonVariant.Primary} isLoading={isBusy}>
            <Trans context="Button">Import</Trans>
          </SpinnableButton>
        )}
        <CloseButton onClick={hideDialog} isDisabled={isBusy} />
      </DialogFooter>
    </Dialog>
  );
}

export function ImportV2DataButton() {
  const { showDialog } = useDialog();

  const onClick = () => {
    showDialog(<ImportV2DataDialog />);
  };

  return (
    <Button onClick={onClick}>
      <Trans context="Button">Import V2 data</Trans>
    </Button>
  );
}
