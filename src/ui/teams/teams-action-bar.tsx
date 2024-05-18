import React from 'react';
import { ActionBar } from 'csdm/ui/components/action-bar';
import { TeamsColumnsVisibility } from './action-bar/teams-columns-visibility';
import { RefreshTeamsButton } from './action-bar/refresh-teams-button';
import { FuzzySearchTextInput } from './action-bar/fuzzy-search-text-input';
import { TeamsFilterDropdown } from './action-bar/teams-filter-dropdown';
import { TeamDetailsButton } from './action-bar/team-details-button';

export function TeamsActionBar() {
  return (
    <ActionBar
      left={
        <>
          <TeamDetailsButton />
        </>
      }
      right={
        <>
          <RefreshTeamsButton />
          <TeamsFilterDropdown />
          <TeamsColumnsVisibility />
          <FuzzySearchTextInput />
        </>
      }
    />
  );
}
