import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { Button } from 'csdm/ui/components/buttons/button';
import { defaultSettings } from 'csdm/node/settings/default-settings';

export function ResetSettingsButton() {
  const { updateSettings } = useVideoSettings();
  const onClick = () => {
    updateSettings(defaultSettings.video);
  };
  return (
    <Button onClick={onClick}>
      <Trans context="Button">Reset settings</Trans>
    </Button>
  );
}
