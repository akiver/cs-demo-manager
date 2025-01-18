import React from 'react';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { GameHeightInput } from 'csdm/ui/settings/shared/game-height-input';

export function RecordingGameHeight() {
  const { settings, updateSettings } = useVideoSettings();

  const onBlur = (height: number | undefined) => {
    if (!height) {
      return;
    }

    updateSettings({
      height,
    });
  };

  return <GameHeightInput height={settings.height} onBlur={onBlur} />;
}
