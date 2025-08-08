import React from 'react';
import { GameWidthInput } from 'csdm/ui/settings/shared/game-width-input';
import { usePlaybackSettings } from './use-playback-settings';

export function GameWidth() {
  const { width, updateSettings } = usePlaybackSettings();

  const onBlur = async (width: number | undefined) => {
    if (!width) {
      return;
    }

    await updateSettings({
      width,
    });
  };

  return <GameWidthInput width={width} onBlur={onBlur} />;
}
