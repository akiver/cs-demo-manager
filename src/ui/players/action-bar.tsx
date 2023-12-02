import React from 'react';
import { ActionBar } from 'csdm/ui/components/action-bar';
import { PlayersColumnsVisibility } from './action-bar/columns-visibility';
import { RefreshPlayersButton } from './action-bar/refresh-button';
import { FuzzySearchTextInput } from './action-bar/fuzzy-search-text-input';
import { PlayersFilterDropdown } from './action-bar/players-filter-dropdown';
import { PlayerDetailsButton } from './action-bar/player-details-button';

export function PlayersActionBar() {
  return (
    <ActionBar
      left={
        <>
          <PlayerDetailsButton />
        </>
      }
      right={
        <>
          <RefreshPlayersButton />
          <PlayersFilterDropdown />
          <PlayersColumnsVisibility />
          <FuzzySearchTextInput />
        </>
      }
    />
  );
}
