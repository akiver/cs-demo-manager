import React from 'react';
import { Trans } from '@lingui/macro';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { useUpdateSettings } from '../use-update-settings';
import { useLocale } from './use-locale';

export function LanguageSelect() {
  const locale = useLocale();
  const updateSettings = useUpdateSettings();

  const options: SelectOption[] = [
    {
      value: 'en',
      label: 'English',
    },
    {
      value: 'fr',
      label: 'Français',
    },
  ];

  return (
    <SettingsEntry
      interactiveComponent={
        <Select
          options={options}
          value={locale}
          onChange={async (selectedLocale) => {
            await updateSettings({
              ui: {
                locale: selectedLocale,
              },
            });

            window.csdm.localeChanged(selectedLocale);
          }}
        />
      }
      description={<Trans>Application language</Trans>}
      title={<Trans context="Settings title">Language</Trans>}
    />
  );
}
