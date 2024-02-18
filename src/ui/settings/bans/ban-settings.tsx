import React from 'react';
import { SettingsView } from '../settings-view';
import { IgnoredSteamAccounts } from './ignored-steam-accounts';
import { ToggleIgnoreBanBeforeFirstSeen } from '../analyze/ignore-ban-before-first-seen';

export function BanSettings() {
  return (
    <SettingsView>
      <ToggleIgnoreBanBeforeFirstSeen />
      <IgnoredSteamAccounts />
    </SettingsView>
  );
}
