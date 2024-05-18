import React from 'react';
import { DeleteMatchesDialog } from 'csdm/ui/components/dialogs/delete-matches-dialog';
import { useFetchTeam } from '../use-fetch-team';

type Props = {
  checksums: string[];
};

export function TeamDeleteMatchesDialog({ checksums }: Props) {
  const fetchTeam = useFetchTeam();

  return (
    <DeleteMatchesDialog
      checksums={checksums}
      onDeleteSuccess={() => {
        fetchTeam();
      }}
    />
  );
}
