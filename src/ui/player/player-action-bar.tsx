import React from 'react';
import { ActionBar } from 'csdm/ui/components/action-bar';
import { PlayerFilterDropdown } from './player-filter-dropdown';
import { PlayerSteamLink } from './player-steam-link';

export function PlayerActionBar() {
  return <ActionBar left={<PlayerSteamLink />} right={<PlayerFilterDropdown />} />;
}
