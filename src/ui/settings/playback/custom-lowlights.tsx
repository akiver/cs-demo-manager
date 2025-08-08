import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Switch } from 'csdm/ui/components/inputs/switch';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { Cs2HighlightsWarning } from './cs2-highlights-warning';
import { usePlaybackSettings } from './use-playback-settings';

export function CustomLowlights() {
  const { useCustomLowlights, updateSettings } = usePlaybackSettings();

  const onChange = async (isChecked: boolean) => {
    await updateSettings({
      useCustomLowlights: isChecked,
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
