import React from 'react';
import { useUpdateSettings } from 'csdm/ui/settings/use-update-settings';
import { useWatchSettings } from 'csdm/ui/settings/playback/use-watch-settings';
import { GameHeightInput } from 'csdm/ui/settings/shared/game-height-input';

export function GameHeight() {
  const { height } = useWatchSettings();
  const updateSettings = useUpdateSettings();

  const onBlur = async (height: number | undefined) => {
    if (!height) {
      return;
    }

    await updateSettings({
      playback: {
        height,
      },
    });
  };

  return <GameHeightInput height={height} onBlur={onBlur} />;
}
