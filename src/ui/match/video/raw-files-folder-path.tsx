import React from 'react';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { FileOrDirectoryInput } from 'csdm/ui/components/inputs/file-or-directory-input';

export function RawFilesFolderPath() {
  const { settings, updateSettings } = useVideoSettings();

  const onFileSelected = async (folderPath: string) => {
    await updateSettings({
      rawFilesFolderPath: folderPath,
    });
  };

  return (
    <FileOrDirectoryInput
      type="folder"
      placeholder="Raw files folder"
      name="raw-files-folder"
      label="Raw files folder"
      dialogTitle="Select raw files folder"
      onFileSelected={onFileSelected}
      path={settings.rawFilesFolderPath}
      isRevealButtonDisabled={settings.rawFilesFolderPath === ''}
    />
  );
}
