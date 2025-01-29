import React from 'react';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { ExportMatchesAsXlsxDialog } from 'csdm/ui/components/dialogs/export-matches-xlsx-dialog';
import type { MatchTable } from 'csdm/common/types/match-table';
import { ExportMatchesToJsonItem } from 'csdm/ui/components/context-menu/items/export-matches-to-json-item';
import { SubContextMenu } from 'csdm/ui/components/context-menu/sub-context-menu';
import { Trans } from '@lingui/react/macro';
import { ExportMatchesToXlsxItem } from './export-matches-to-xlsx-item';
import { ExportPlayersVoiceItem } from './export-players-voice-item';

type Props = {
  matches: MatchTable[];
};

export function ExportMatchesItem({ matches }: Props) {
  const { showDialog } = useDialog();

  if (matches.length === 0) {
    return null;
  }

  const checksums: string[] = [];
  const shareCodes: string[] = [];
  const filepaths: string[] = [];
  for (const match of matches) {
    checksums.push(match.checksum);
    shareCodes.push(match.shareCode);
    filepaths.push(match.demoFilePath);
  }

  const onExportToXlsxClick = () => {
    showDialog(<ExportMatchesAsXlsxDialog matches={matches} />);
  };

  return (
    <SubContextMenu label={<Trans context="Context menu">Export</Trans>}>
      <ExportMatchesToXlsxItem onClick={onExportToXlsxClick} />
      <ExportMatchesToJsonItem checksums={checksums} />
      <ExportPlayersVoiceItem demoPaths={filepaths} />
    </SubContextMenu>
  );
}
