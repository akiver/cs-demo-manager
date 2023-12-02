import React from 'react';
import { Trans } from '@lingui/macro';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';

export function ShowOnlyDeathNoticesCheckbox() {
  const { settings, updateSettings } = useVideoSettings();

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await updateSettings({
      showOnlyDeathNotices: event.target.checked,
    });
  };

  return (
    <Checkbox
      id="show-only-death-notices"
      label={<Trans context="Input label">Show only death notices</Trans>}
      onChange={onChange}
      isChecked={settings.showOnlyDeathNotices}
    />
  );
}
