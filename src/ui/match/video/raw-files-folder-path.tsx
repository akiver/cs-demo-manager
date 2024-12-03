import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { FileOrDirectoryInput } from 'csdm/ui/components/inputs/file-or-directory-input';

export function RawFilesFolderPath() {
  const { t } = useLingui();
  const { settings, updateSettings } = useVideoSettings();

  const onFileSelected = async (folderPath: string) => {
    await updateSettings({
      rawFilesFolderPath: folderPath,
    });
  };

  return (
    <FileOrDirectoryInput
      type="folder"
      placeholder={t({
        comment: 'Input placeholder',
        message: 'Raw files folder',
      })}
      name="raw-files-folder"
      label={<Trans context="Input label">Raw files folder</Trans>}
      dialogTitle={t({
        context: 'Dialog title',
        message: 'Select raw files folder',
      })}
      onFileSelected={onFileSelected}
      path={settings.rawFilesFolderPath}
      isRevealButtonDisabled={settings.rawFilesFolderPath === ''}
    />
  );
}
