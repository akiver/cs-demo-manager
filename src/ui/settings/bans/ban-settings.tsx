import React from 'react';
import { SettingsView } from '../settings-view';
import { IgnoredSteamAccounts } from './ignored-steam-accounts';

export function BanSettings() {
  return (
    <SettingsView>
      <IgnoredSteamAccounts />
    </SettingsView>
  );
}
