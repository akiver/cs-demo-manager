import React from 'react';
import { Trans } from '@lingui/macro';
import { Switch } from 'csdm/ui/components/inputs/switch';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { useUpdateSettings } from '../use-update-settings';
import { useWatchSettings } from './use-watch-settings';
import { Cs2HighlightsWarning } from './cs2-highlights-warning';

export function CustomHighlights() {
  const { useCustomHighlights } = useWatchSettings();
  const updateSettings = useUpdateSettings();

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    await updateSettings({
      playback: {
        useCustomHighlights: checked,
      },
    });
  };

  return (
    <SettingsEntry
      interactiveComponent={<Switch isChecked={useCustomHighlights} onChange={onChange} />}
      description={
        <div className="flex flex-col">
          <span>
            <Trans>Use a custom highlights algorithm to generate players highlights</Trans>
          </span>
          <Cs2HighlightsWarning />
        </div>
      }
      title={<Trans context="Settings title">Custom highlights</Trans>}
    />
  );
}
