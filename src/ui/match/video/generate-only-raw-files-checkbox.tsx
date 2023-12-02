import React from 'react';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';

export function GenerateOnlyRawFilesCheckbox() {
  const { settings, updateSettings } = useVideoSettings();

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await updateSettings({
      generateOnlyRawFiles: event.target.checked,
    });
  };

  return (
    <Checkbox
      id="generate-only-raw-files"
      label="Generate only raw files"
      onChange={onChange}
      isChecked={settings.generateOnlyRawFiles}
    />
  );
}
