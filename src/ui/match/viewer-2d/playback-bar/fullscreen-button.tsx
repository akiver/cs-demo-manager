import React, { useEffect } from 'react';
import { useFullscreen } from '../use-fullscreen';
import { MinimizeIcon } from 'csdm/ui/icons/minimize-icon';
import { MaximizeIcon } from 'csdm/ui/icons/maximize-icon';
import { PlaybackBarButton } from './playback-bar-button';
import { isCtrlOrCmdEvent } from 'csdm/ui/keyboard/keyboard';

export function FullscreenButton() {
  const { isFullscreenEnabled, toggleFullscreen } = useFullscreen();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isCtrlOrCmdEvent(event)) {
        return;
      }

      if (event.key === 'f') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [toggleFullscreen]);

  return (
    <PlaybackBarButton onClick={toggleFullscreen}>
      {isFullscreenEnabled ? <MinimizeIcon height={24} /> : <MaximizeIcon height={24} />}
    </PlaybackBarButton>
  );
}
