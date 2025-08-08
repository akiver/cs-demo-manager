import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Switch } from 'csdm/ui/components/inputs/switch';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { Cs2HighlightsWarning } from './cs2-highlights-warning';
import { usePlaybackSettings } from './use-playback-settings';

export function CustomHighlights() {
  const { useCustomHighlights, updateSettings } = usePlaybackSettings();

  const onChange = async (isChecked: boolean) => {
    await updateSettings({
      useCustomHighlights: isChecked,
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
