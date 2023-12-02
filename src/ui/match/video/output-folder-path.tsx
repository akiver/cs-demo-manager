import React from 'react';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { FileOrDirectoryInput } from 'csdm/ui/components/inputs/file-or-directory-input';

export function OutputFolderPath() {
  const { settings, updateSettings } = useVideoSettings();

  const onFileSelected = async (folderPath: string) => {
    await updateSettings({
      outputFolderPath: folderPath,
    });
  };

  return (
    <FileOrDirectoryInput
      type="folder"
      placeholder="Output folder"
      name="output-folder"
      label="Output folder"
      dialogTitle="Select output folder"
      onFileSelected={onFileSelected}
      path={settings.outputFolderPath}
    />
  );
}
