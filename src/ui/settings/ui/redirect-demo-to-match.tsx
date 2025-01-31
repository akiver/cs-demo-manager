import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Switch } from 'csdm/ui/components/inputs/switch';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { useUpdateSettings } from '../use-update-settings';
import { useUiSettings } from './use-ui-settings';

export function RedirectDemoToMatch() {
  const { redirectDemoToMatch } = useUiSettings();
  const updateSettings = useUpdateSettings();

  const onChange = async (isChecked: boolean) => {
    await updateSettings({
      ui: {
        redirectDemoToMatch: isChecked,
      },
    });
  };

  return (
    <SettingsEntry
      interactiveComponent={<Switch isChecked={redirectDemoToMatch} onChange={onChange} />}
      description={<Trans>Navigate to the demo's match page when going to a analyzed demo page.</Trans>}
      title={<Trans context="Settings title">Redirect demo to match</Trans>}
    />
  );
}
