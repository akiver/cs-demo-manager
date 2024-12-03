import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { FileOrDirectoryInput } from 'csdm/ui/components/inputs/file-or-directory-input';

export function OutputFolderPath() {
  const { t } = useLingui();
  const { settings, updateSettings } = useVideoSettings();

  const onFileSelected = async (folderPath: string) => {
    await updateSettings({
      outputFolderPath: folderPath,
    });
  };

  return (
    <FileOrDirectoryInput
      type="folder"
      placeholder={t({
        comment: 'Input placeholder',
        message: 'Output folder',
      })}
      name="output-folder"
      label={<Trans context="Input label">Output folder</Trans>}
      dialogTitle={t({
        context: 'Dialog title',
        message: 'Select output folder',
      })}
      onFileSelected={onFileSelected}
      path={settings.outputFolderPath}
    />
  );
}
