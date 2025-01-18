import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Switch } from 'csdm/ui/components/inputs/switch';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { useUpdateSettings } from '../use-update-settings';
import { useWatchSettings } from './use-watch-settings';

export function HighlightsIncludeDamages() {
  const { highlights } = useWatchSettings();
  const updateSettings = useUpdateSettings();

  const onChange = async (isChecked: boolean) => {
    await updateSettings({
      playback: {
        highlights: {
          includeDamages: isChecked,
        },
      },
    });
  };

  return (
    <SettingsEntry
      interactiveComponent={<Switch isChecked={highlights.includeDamages} onChange={onChange} />}
      description={
        <span>
          <Trans>Include health damages above 40HP that did not result into a player's kill in highlights</Trans>
        </span>
      }
      title={<Trans context="Settings title">Include damages (highlights)</Trans>}
    />
  );
}
