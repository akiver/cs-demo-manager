import React from 'react';
import { ActionBar } from 'csdm/ui/components/action-bar';
import { TeamFilterDropdown } from './team-filter-dropdown';
import { TeamName } from './team-name';

export function TeamActionBar() {
  return <ActionBar left={<TeamName />} right={<TeamFilterDropdown />} />;
}
