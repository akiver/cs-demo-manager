import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';

export function DeleteRawFilesAfterEncodingCheckbox() {
  const { settings, updateSettings } = useVideoSettings();

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await updateSettings({
      deleteRawFilesAfterEncoding: event.target.checked,
    });
  };

  if (settings.generateOnlyRawFiles) {
    return null;
  }

  return (
    <Checkbox
      label={<Trans context="Checkbox label">Delete raw files after encoding</Trans>}
      onChange={onChange}
      isChecked={settings.deleteRawFilesAfterEncoding}
    />
  );
}
