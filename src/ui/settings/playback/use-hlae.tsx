import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Switch } from 'csdm/ui/components/inputs/switch';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { useWatchSettings } from 'csdm/ui/settings/playback/use-watch-settings';
import { useUpdateSettings } from 'csdm/ui/settings/use-update-settings';
import { useSettingsOverlay } from 'csdm/ui/settings//use-settings-overlay';
import { SettingsCategory } from 'csdm/ui/settings//settings-category';

export function UseHlae() {
  const { useHlae } = useWatchSettings();
  const updateSettings = useUpdateSettings();
  const { showCategory } = useSettingsOverlay();

  const onChange = async (isChecked: boolean) => {
    await updateSettings({
      playback: {
        useHlae: isChecked,
      },
    });
  };

  return (
    <SettingsEntry
      interactiveComponent={<Switch isChecked={useHlae} onChange={onChange} />}
      description={
        <Trans>
          Start Counter-Strike using HLAE configured in the{' '}
          <button
            className="text-blue-500 underline"
            onClick={() => {
              showCategory(SettingsCategory.Video);
            }}
          >
            video settings
          </button>
        </Trans>
      }
      title={<Trans context="Settings title">Use HLAE</Trans>}
    />
  );
}
