import React from 'react';
import { IgnoredSteamAccounts } from './ignored-steam-accounts';
import { ToggleIgnoreBanBeforeFirstSeen } from '../analyze/ignore-ban-before-first-seen';

export function BanSettings() {
  return (
    <>
      <ToggleIgnoreBanBeforeFirstSeen />
      <IgnoredSteamAccounts />
    </>
  );
}
