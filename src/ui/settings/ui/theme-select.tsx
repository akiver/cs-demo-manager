import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { ThemeName } from 'csdm/common/types/theme-name';
import { useUpdateSettings } from '../use-update-settings';
import { useThemeName } from './use-theme-name';

export function ThemeSelect() {
  const { t } = useLingui();
  const themeName = useThemeName();
  const updateSettings = useUpdateSettings();

  const labelPerTheme: Record<ThemeName, string> = {
    [ThemeName.Light]: t({
      context: 'Select option theme',
      message: 'Light',
    }),
    [ThemeName.Dark]: t({
      context: 'Select option theme',
      message: 'Dark',
    }),
  };

  const options: SelectOption<ThemeName>[] = Object.values(ThemeName).map((themeName) => {
    return {
      value: themeName,
      label: labelPerTheme[themeName],
    };
  });

  return (
    <SettingsEntry
      interactiveComponent={
        <Select
          options={options}
          value={themeName}
          onChange={async (selectedTheme) => {
            const className = selectedTheme === ThemeName.Dark ? 'dark' : '';
            document.documentElement.className = className;

            await updateSettings({
              ui: {
                theme: selectedTheme,
              },
            });
          }}
        />
      }
      description={<Trans>Application UI theme</Trans>}
      title={<Trans context="Settings title">Theme</Trans>}
    />
  );
}
