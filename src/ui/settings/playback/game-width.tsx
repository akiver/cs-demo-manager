import React from 'react';
import { useUpdateSettings } from 'csdm/ui/settings/use-update-settings';
import { useWatchSettings } from 'csdm/ui/settings/playback/use-watch-settings';
import { GameWidthInput } from 'csdm/ui/settings/shared/game-width-input';

export function GameWidth() {
  const { width } = useWatchSettings();
  const updateSettings = useUpdateSettings();

  const onBlur = async (width: number | undefined) => {
    if (!width) {
      return;
    }

    await updateSettings({
      playback: {
        width,
      },
    });
  };

  return <GameWidthInput width={width} onBlur={onBlur} />;
}
