import React from 'react';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { defaultSettings } from 'csdm/node/settings/default-settings';

export function FramerateInput() {
  const { settings, updateSettings } = useVideoSettings();

  const onBlur = async (event: React.FocusEvent<HTMLInputElement>) => {
    let newFramerate = Number(event.target.value);
    if (newFramerate <= 0) {
      newFramerate = defaultSettings.video.framerate;
      event.target.value = newFramerate.toString();
    }

    await updateSettings({
      framerate: newFramerate,
    });
  };

  return (
    <InputNumber
      key={settings.framerate}
      id="framerate"
      label="Framerate"
      min={1}
      defaultValue={settings.framerate}
      onBlur={onBlur}
      placeholder="Framerate"
    />
  );
}
