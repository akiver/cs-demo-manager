import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { useUpdateSettings } from '../use-update-settings';
import { useLocale } from './use-locale';

export function LanguageSelect() {
  const locale = useLocale();
  const updateSettings = useUpdateSettings();

  /* eslint-disable lingui/no-unlocalized-strings */
  const options: SelectOption[] = [
    {
      value: 'en',
      label: 'English',
    },
    {
      value: 'fr',
      label: 'Français',
    },
    {
      value: 'pt-BR',
      label: 'Português (Brasil)',
    },
    {
      value: 'zh-CN',
      label: '简体中文',
    },
    {
      value: 'de',
      label: 'Deutsch',
    },
  ];
  /* eslint-enable lingui/no-unlocalized-strings */

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
