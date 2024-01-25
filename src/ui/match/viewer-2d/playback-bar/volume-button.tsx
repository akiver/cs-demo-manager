import React, { useEffect, useState } from 'react';
import { useViewerContext } from '../use-viewer-context';
import { PlaybackBarButton } from './playback-bar-button';
import { VolumeOnIcon } from 'csdm/ui/icons/volume-on-icon';
import { VolumeOffIcon } from 'csdm/ui/icons/volume-off-icon';
import { VerticalSlider } from './vertical-slider';
import { isCtrlOrCmdEvent } from 'csdm/ui/keyboard/keyboard';

export function VolumeButton() {
  const [isSliderVisible, setIsSliderVisible] = useState(false);
  const { volume, setVolume } = useViewerContext();
  const min = 0;
  const max = 1;
  const interval = 0.1;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isCtrlOrCmdEvent(event)) {
        return;
      }

      if (event.key === 'ArrowUp') {
        setVolume(Math.min(volume + interval, max));
      } else if (event.key === 'ArrowDown') {
        setVolume(Math.max(volume - interval, min));
      } else if (event.key === 'm') {
        setVolume(volume === min ? max : min);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [setVolume, volume]);

  return (
    <PlaybackBarButton
      onMouseEnter={() => {
        setIsSliderVisible(true);
      }}
      onMouseLeave={() => {
        setIsSliderVisible(false);
      }}
    >
      {isSliderVisible && (
        <VerticalSlider
          value={volume}
          min={min}
          max={max}
          step={0.01}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const newVolume = +event.target.value;
            setVolume(newVolume);
          }}
        />
      )}
      <div
        className="size-full"
        onClick={() => {
          const newVolume = volume === min ? max : min;
          setVolume(newVolume);
        }}
      >
        {volume === 0 ? <VolumeOffIcon /> : <VolumeOnIcon />}
      </div>
    </PlaybackBarButton>
  );
}
