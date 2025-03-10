import React from 'react';
import { SubContextMenu } from 'csdm/ui/components/context-menu/sub-context-menu';
import { Trans } from '@lingui/react/macro';
import { ExportPlayersVoiceItem } from 'csdm/ui/components/context-menu/items/export-players-voice-item';

type Props = {
  filepaths: string[];
};

export function ExportDemosItem({ filepaths }: Props) {
  if (filepaths.length === 0) {
    return null;
  }

  return (
    <SubContextMenu label={<Trans context="Context menu">Export</Trans>}>
      <ExportPlayersVoiceItem demoPaths={filepaths} />
    </SubContextMenu>
  );
}
