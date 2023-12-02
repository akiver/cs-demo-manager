import React from 'react';
import { RenameDialog } from 'csdm/ui/components/dialogs/rename-dialog';
import type { Demo } from 'csdm/common/types/demo';

type Props = {
  demos: Demo[];
};

export function RenameDemoDialog({ demos }: Props) {
  if (demos.length === 0) {
    return null;
  }

  const [{ name, checksum }] = demos;

  return <RenameDialog checksum={checksum} currentName={name} />;
}
