import React from 'react';
import type { OpenDialogOptions, OpenDialogReturnValue } from 'electron';
import { Trans, useLingui } from '@lingui/react/macro';
import { useHlaeSettings } from 'csdm/ui/settings/video/hlae/use-hlae-settings';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';
import { FileOrDirectoryInput } from 'csdm/ui/components/inputs/file-or-directory-input';

export function HlaeConfigFolderPath() {
  const { t } = useLingui();
  const { hlaeSettings, updateHlaeSettings } = useHlaeSettings();
  const { configFolderPath, configFolderEnabled } = hlaeSettings;

  const updateConfigFolderPath = async (folderPath: string) => {
    await updateHlaeSettings({
      configFolderPath: folderPath,
    });
  };

  const showSelectFolderDialog = async () => {
    const options: OpenDialogOptions = { properties: ['openDirectory'] };
    const { filePaths }: OpenDialogReturnValue = await window.csdm.showOpenDialog(options);
    if (filePaths.length > 0) {
      const [folder] = filePaths;
      await updateConfigFolderPath(folder);
      return true;
    }

    return false;
  };

  const onEnableChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;

    const folderExists = await window.csdm.pathExists(configFolderPath);
    if (isChecked && !folderExists) {
      const isValidPath = await showSelectFolderDialog();
      if (isValidPath) {
        await updateHlaeSettings({
          configFolderEnabled: isChecked,
        });
      }
    } else {
      await updateHlaeSettings({
        configFolderEnabled: isChecked,
      });
    }
  };

  return (
    <div>
      <Checkbox
        label={<Trans context="Checkbox label">Enable config folder</Trans>}
        isChecked={configFolderEnabled}
        onChange={onEnableChange}
      />
      <FileOrDirectoryInput
        type="folder"
        label={<Trans context="Input label">Config folder</Trans>}
        placeholder={t`Config folder`}
        dialogTitle={t`Select config folder`}
        path={configFolderPath}
        isInputDisabled={!configFolderEnabled}
        isSelectButtonDisabled={!configFolderEnabled}
        isRevealButtonDisabled={!configFolderEnabled}
        onFileSelected={updateConfigFolderPath}
      />
    </div>
  );
}
