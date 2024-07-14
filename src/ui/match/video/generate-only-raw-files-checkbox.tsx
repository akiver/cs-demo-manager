import React from 'react';
import { Trans } from '@lingui/macro';
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
      label={<Trans context="Checkbox label">Generate only raw files</Trans>}
      onChange={onChange}
      isChecked={settings.generateOnlyRawFiles}
    />
  );
}
