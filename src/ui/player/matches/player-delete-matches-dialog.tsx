import React from 'react';
import { DeleteMatchesDialog } from 'csdm/ui/components/dialogs/delete-matches-dialog';
import { useFetchPlayer } from '../use-fetch-player';

type Props = {
  checksums: string[];
};

export function PlayerDeleteMatchesDialog({ checksums }: Props) {
  const fetchPlayer = useFetchPlayer();

  return (
    <DeleteMatchesDialog
      checksums={checksums}
      onDeleteSuccess={() => {
        fetchPlayer();
      }}
    />
  );
}
