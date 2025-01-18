import React from 'react';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { GameWidthInput } from 'csdm/ui/settings/shared/game-width-input';

export function RecordingGameWidth() {
  const { settings, updateSettings } = useVideoSettings();

  const onBlur = (width: number | undefined) => {
    if (!width) {
      return;
    }

    updateSettings({
      width,
    });
  };

  return <GameWidthInput width={settings.width} onBlur={onBlur} />;
}
