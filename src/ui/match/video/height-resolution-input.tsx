import React from 'react';
import { Trans, msg } from '@lingui/macro';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';
import { DEFAULT_HEIGHT_RESOLUTION } from 'csdm/ui/settings/video/default-values';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

export function HeightResolutionInput() {
  const _ = useI18n();
  const { settings, updateSettings } = useVideoSettings();
  const minimalHeight = 600;

  const onBlur = async (event: React.FocusEvent<HTMLInputElement>) => {
    let newHeight = Number(event.target.value);
    if (newHeight < minimalHeight) {
      newHeight = DEFAULT_HEIGHT_RESOLUTION;
      event.target.value = newHeight.toString();
    }

    await updateSettings({
      height: newHeight,
    });
  };

  return (
    <InputNumber
      key={settings.height}
      id="height"
      label={<Trans context="Input label">Height</Trans>}
      min={minimalHeight}
      defaultValue={settings.height}
      onBlur={onBlur}
      placeholder={_(
        msg({
          context: 'Input placeholder',
          message: 'Height',
        }),
      )}
    />
  );
}
