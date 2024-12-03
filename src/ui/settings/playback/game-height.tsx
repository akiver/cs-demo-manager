import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';
import { useUpdateSettings } from '../use-update-settings';
import { useWatchSettings } from './use-watch-settings';

export function GameHeight() {
  const { height } = useWatchSettings();
  const { t } = useLingui();
  const updateSettings = useUpdateSettings();

  const onBlur = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = Number.parseInt(event.target.value);

    await updateSettings({
      playback: {
        height: newHeight,
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
            message: 'Height',
          })}
          defaultValue={String(height)}
          min={600}
          max={1440}
        />
      }
      description={<Trans>Set the game height resolution</Trans>}
      title={<Trans context="Settings title">Height</Trans>}
    />
  );
}
