import React from 'react';
import { useMatchesLoaded } from '../use-matches-loaded';
import { useNavigateToMatch } from 'csdm/ui/hooks/use-navigate-to-match';
import { useMatchesTable } from '../table/use-matches-table';
import { DetailsButton } from 'csdm/ui/components/buttons/details-button';
import { lastArrayItem } from 'csdm/common/array/last-array-item';

export function MatchDetailsButton() {
  const navigateToMatch = useNavigateToMatch();
  const table = useMatchesTable();
  const selectedChecksums = table.getSelectedRowIds();
  const matchesLoaded = useMatchesLoaded();

  if (selectedChecksums.length === 0) {
    return null;
  }

  const onClick = () => {
    const checksum = lastArrayItem(selectedChecksums);
    navigateToMatch(checksum);
  };

  return <DetailsButton onClick={onClick} isDisabled={!matchesLoaded} />;
}
