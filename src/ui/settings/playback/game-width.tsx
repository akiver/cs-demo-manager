import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';
import { useUpdateSettings } from '../use-update-settings';
import { useWatchSettings } from './use-watch-settings';

export function GameWidth() {
  const { width } = useWatchSettings();
  const { t } = useLingui();
  const updateSettings = useUpdateSettings();

  const onBlur = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = Number.parseInt(event.target.value);

    await updateSettings({
      playback: {
        width: newWidth,
      },
    });
  };

  return (
    <SettingsEntry
      interactiveComponent={
        <InputNumber
          onBlur={onBlur}
          placeholder={t({
            context: 'Input placeholder',
            message: 'Width',
          })}
          defaultValue={String(width)}
          min={800}
          max={2560}
        />
      }
      description={<Trans>Set the game width resolution</Trans>}
      title={<Trans context="Settings title">Width</Trans>}
    />
  );
}
