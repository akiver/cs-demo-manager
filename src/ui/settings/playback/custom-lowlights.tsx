import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Switch } from 'csdm/ui/components/inputs/switch';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { useUpdateSettings } from '../use-update-settings';
import { useWatchSettings } from './use-watch-settings';
import { Cs2HighlightsWarning } from './cs2-highlights-warning';

export function CustomLowlights() {
  const { useCustomLowlights } = useWatchSettings();
  const updateSettings = useUpdateSettings();

  const onChange = async (isChecked: boolean) => {
    await updateSettings({
      playback: {
        useCustomLowlights: isChecked,
      },
    });
  };

  return (
    <SettingsEntry
      interactiveComponent={<Switch isChecked={useCustomLowlights} onChange={onChange} />}
      description={
        <div className="flex flex-col">
          <span>
            <Trans>Use a custom lowlights algorithm to generate players lowlights</Trans>
          </span>
          <Cs2HighlightsWarning />
        </div>
      }
      title={<Trans context="Settings title">Lowlights</Trans>}
    />
  );
}
