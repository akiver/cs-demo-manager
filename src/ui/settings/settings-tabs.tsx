import React from 'react';
import { Trans } from '@lingui/react/macro';
import { SettingsCategoryButton } from 'csdm/ui/settings/settings-category-button';
import { CloseSettingsButton } from './close-settings-button';
import { SettingsCategory } from './settings-category';

export function SettingsTabs() {
  return (
    <div className="flex h-full flex-col overflow-y-auto border-r border-r-gray-300 bg-gray-50 p-16">
      <CloseSettingsButton />
      <SettingsCategoryButton category={SettingsCategory.UI}>
        <Trans>UI</Trans>
      </SettingsCategoryButton>
      <SettingsCategoryButton category={SettingsCategory.Folders}>
        <Trans>Folders</Trans>
      </SettingsCategoryButton>
      <SettingsCategoryButton category={SettingsCategory.Tags}>
        <Trans>Tags</Trans>
      </SettingsCategoryButton>
      <SettingsCategoryButton category={SettingsCategory.Maps}>
        <Trans>Maps</Trans>
      </SettingsCategoryButton>
      <SettingsCategoryButton category={SettingsCategory.Download}>
        <Trans>Download</Trans>
      </SettingsCategoryButton>
      <SettingsCategoryButton category={SettingsCategory.Playback}>
        <Trans>Playback</Trans>
      </SettingsCategoryButton>
      <SettingsCategoryButton category={SettingsCategory.Analyze}>
        <Trans>Analyze</Trans>
      </SettingsCategoryButton>
      <SettingsCategoryButton category={SettingsCategory.Video}>
        <Trans>Video</Trans>
      </SettingsCategoryButton>
      <SettingsCategoryButton category={SettingsCategory.Ban}>
        <Trans>Ban</Trans>
      </SettingsCategoryButton>
      <SettingsCategoryButton category={SettingsCategory.Integrations}>
        <Trans>Integrations</Trans>
      </SettingsCategoryButton>
      <SettingsCategoryButton category={SettingsCategory.Database}>
        <Trans>Database</Trans>
      </SettingsCategoryButton>
      <SettingsCategoryButton category={SettingsCategory.About}>
        <Trans>About</Trans>
      </SettingsCategoryButton>
    </div>
  );
}
