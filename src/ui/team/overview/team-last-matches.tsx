import React from 'react';
import { useTeam } from '../use-team';
import { LastMatches } from 'csdm/ui/components/last-matches';

export function TeamLastMatches() {
  const { lastMatches } = useTeam();

  return <LastMatches matches={lastMatches} />;
}
