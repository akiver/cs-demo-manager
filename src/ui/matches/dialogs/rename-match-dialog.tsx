import React from 'react';
import { RenameDialog } from 'csdm/ui/components/dialogs/rename-dialog';
import type { MatchTable } from 'csdm/common/types/match-table';

type Props = {
  matches: MatchTable[];
};

export function RenameMatchDialog({ matches }: Props) {
  if (matches.length === 0) {
    return null;
  }

  const [{ name, checksum }] = matches;

  return <RenameDialog checksum={checksum} currentName={name} />;
}
