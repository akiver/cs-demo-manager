import React from 'react';
import { Trans, msg } from '@lingui/macro';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

export function WidthResolutionInput() {
  const _ = useI18n();
  const { settings, updateSettings } = useVideoSettings();
  const minimalWidth = 800;

  const onBlur = async (event: React.FocusEvent<HTMLInputElement>) => {
    let newWidth = Number(event.target.value);
    if (newWidth < minimalWidth) {
      newWidth = minimalWidth;
      event.target.value = newWidth.toString();
    }

    await updateSettings({
      width: newWidth,
    });
  };

  return (
    <InputNumber
      key={settings.width}
      id="width"
      label={<Trans context="Input label">Width</Trans>}
      onBlur={onBlur}
      defaultValue={settings.width}
      min={minimalWidth}
      placeholder={_(
        msg({
          context: 'Input placeholder',
          message: 'Width',
        }),
      )}
    />
  );
}
