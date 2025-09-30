import React from 'react';
import { SettingsView } from 'csdm/ui/settings/settings-view';
import { ThemeSelect } from 'csdm/ui/settings/ui/theme-select';
import { LanguageSelect } from 'csdm/ui/settings/ui/language-select';
import { SystemStartupBehavior } from './system-startup-behavior';
import { ResetTablesState } from './reset-tables-state';
import { InitialPageSelect } from './initial-page-select';
import { RedirectDemoToMatch } from './redirect-demo-to-match';
import { EnableHardwareAcceleration } from './enable-hardware-acceleration';

export function UiSettings() {
  return (
    <SettingsView>
      <ThemeSelect />
      <LanguageSelect />
      <SystemStartupBehavior />
      <InitialPageSelect />
      <RedirectDemoToMatch />
      <EnableHardwareAcceleration />
      <ResetTablesState />
    </SettingsView>
  );
}
