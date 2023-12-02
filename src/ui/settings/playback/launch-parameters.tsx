import React from 'react';
import { Trans, msg } from '@lingui/macro';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { useUpdateSettings } from '../use-update-settings';
import { useWatchSettings } from './use-watch-settings';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

export function LaunchParameters() {
  const { launchParameters } = useWatchSettings();
  const _ = useI18n();
  const updateSettings = useUpdateSettings();

  const onBlur = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLaunchParameters: string = event.target.value;
    if (newLaunchParameters !== launchParameters) {
      await updateSettings({
        playback: {
          launchParameters: event.target.value,
        },
      });
    }
  };

  return (
    <SettingsEntry
      interactiveComponent={
        <TextInput
          onBlur={onBlur}
          defaultValue={launchParameters}
          placeholder={_(
            msg({
              context: 'Input placeholder',
              message: 'Launch parameters',
            }),
          )}
        />
      }
      description={<Trans>Additional launch parameters added to the game when it starts</Trans>}
      title={<Trans context="Settings title">Launch parameters</Trans>}
    />
  );
}
