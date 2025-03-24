import { Trans, useLingui } from '@lingui/react/macro';
import React, { useState, type ReactNode } from 'react';
import { useDialog } from './use-dialog';
import { XlsxOutputType } from 'csdm/node/xlsx/xlsx-output';
import type { OpenDialogOptions, SaveDialogOptions } from 'electron';
import { RadioInput } from '../inputs/radio-input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { Button, ButtonVariant } from '../buttons/button';
import { CloseButton } from '../buttons/close-button';
import { getFormattedDateForFilename } from 'csdm/common/date/get-formatted-date-for-filename';

type Props = {
  ids: string[];
  renderCheckboxes: (isExportIntoSingleFile: boolean) => ReactNode;
  onOutputSelected: (type: 'folder' | 'file', outputPath: string, formData: FormData) => void;
};

export function ExportXlsxOptionsDialog({ ids, onOutputSelected, renderCheckboxes }: Props) {
  const { t } = useLingui();
  const { hideDialog } = useDialog();
  const [atLeastOneSheetSelected, setAtLeastOneSheetSelected] = useState(true);
  const [outputType, setOutputType] = useState<XlsxOutputType>(XlsxOutputType.SingleFile);
  const isExportButtonDisabled = !atLeastOneSheetSelected;
  const isSingleSelection = ids.length === 1;

  const isAtLeastOneSheetSelected = (formData: FormData) => {
    for (const fieldName of formData.keys()) {
      if (fieldName.startsWith('sheets.')) {
        return true;
      }
    }

    return false;
  };

  const onFormChange = (event: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    setAtLeastOneSheetSelected(isAtLeastOneSheetSelected(formData));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    if (isExportButtonDisabled) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    if (outputType === XlsxOutputType.SingleFile && !isSingleSelection) {
      const name = getFormattedDateForFilename('xlsx');
      const options: SaveDialogOptions = {
        buttonLabel: t({
          context: 'Button label',
          message: 'Export',
        }),
        defaultPath: name,
        filters: [{ name, extensions: ['xlsx'] }],
      };
      const { canceled, filePath: outputFilePath } = await window.csdm.showSaveDialog(options);
      if (canceled || outputFilePath === undefined) {
        return;
      }

      onOutputSelected('file', outputFilePath, formData);
    } else {
      const options: OpenDialogOptions = {
        buttonLabel: t({
          context: 'Button label',
          message: 'Export',
        }),
        properties: ['openDirectory'],
      };
      const { canceled, filePaths } = await window.csdm.showOpenDialog(options);
      if (canceled || filePaths.length === 0) {
        return;
      }
      onOutputSelected('folder', filePaths[0], formData);
    }
  };

  return (
    <Dialog>
      <DialogHeader>
        <DialogTitle>
          <Trans context="Dialog title">Excel export</Trans>
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit} onChange={onFormChange}>
        <DialogContent>
          <div className="gap-y-8">
            <div className={isSingleSelection ? 'hidden' : undefined}>
              <p className="text-body-strong">
                <Trans context="File destination">Output</Trans>
              </p>
              <div className="flex gap-8 mt-4 flex-wrap">
                <RadioInput
                  id="single"
                  name="output-type"
                  value={XlsxOutputType.SingleFile}
                  label={<Trans context="Radio label">Single file</Trans>}
                  defaultChecked={true}
                  onChange={() => setOutputType(XlsxOutputType.SingleFile)}
                />
                <RadioInput
                  id="multiple"
                  name="output-type"
                  value={XlsxOutputType.MultipleFiles}
                  label={<Trans context="Radio label">Multiple files</Trans>}
                  onChange={() => setOutputType(XlsxOutputType.MultipleFiles)}
                />
              </div>
            </div>
            <div className="max-w-[448px] mt-8">
              <p className="text-body-strong">
                <Trans context="Excel sheets">Sheets</Trans>
              </p>
              <div className="flex gap-8 mt-4 flex-wrap">
                {renderCheckboxes(isSingleSelection || outputType === XlsxOutputType.MultipleFiles)}
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant={ButtonVariant.Primary} type="submit" isDisabled={isExportButtonDisabled}>
            <Trans context="Button">Export</Trans>
          </Button>
          <CloseButton onClick={hideDialog} />
        </DialogFooter>
      </form>
    </Dialog>
  );
}
