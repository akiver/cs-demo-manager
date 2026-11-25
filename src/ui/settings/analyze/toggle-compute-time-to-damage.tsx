import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Switch } from 'csdm/ui/components/inputs/switch';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { useAnalyzeSettings } from './use-analyze-settings';
import { useUpdateSettings } from '../use-update-settings';

export function ToggleComputeTimeToDamage() {
  const updateSettings = useUpdateSettings();
  const { computeTimeToDamage } = useAnalyzeSettings();

  return (
    <SettingsEntry
      interactiveComponent={
        <Switch
          isChecked={computeTimeToDamage}
          onChange={async (isChecked: boolean) => {
            await updateSettings({
              analyze: {
                computeTimeToDamage: isChecked,
              },
            });
          }}
        />
      }
      description={
        <Trans>
          Compute the time between the moment players see an enemy and the moment they damage or kill them (CS2 only).
          It requires the collision geometry of the maps, downloaded the first time a demo is analyzed on a map (up to
          40 MB per map).
        </Trans>
      }
      title={<Trans>Compute time to damage/kill</Trans>}
    />
  );
}
