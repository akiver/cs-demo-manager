import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Switch } from 'csdm/ui/components/inputs/switch';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { useUpdateSettings } from '../use-update-settings';
import { useBanSettings } from '../bans/use-ban-settings';

export function ToggleIgnoreBanBeforeFirstSeen() {
  const updateSettings = useUpdateSettings();
  const { ignoreBanBeforeFirstSeen } = useBanSettings();

  return (
    <SettingsEntry
      interactiveComponent={
        <Switch
          isChecked={ignoreBanBeforeFirstSeen}
          onChange={async (event) => {
            await updateSettings({
              ban: {
                ignoreBanBeforeFirstSeen: event.target.checked,
              },
            });
          }}
        />
      }
      description={<Trans>Bans that happened before the player was first seen in a match will be ignored.</Trans>}
      title={<Trans>Ignore bans happened before first match</Trans>}
    />
  );
}
