import React from 'react';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { ExportMatchesAsXlsxDialog } from 'csdm/ui/components/dialogs/export-matches-xlsx-dialog';
import type { MatchTable, MatchTablePlayer } from 'csdm/common/types/match-table';
import { ExportMatchesToJsonItem } from 'csdm/ui/components/context-menu/items/export-matches-to-json-item';
import { SubContextMenu } from 'csdm/ui/components/context-menu/sub-context-menu';
import { Trans } from '@lingui/react/macro';
import { ExportToXlsxItem } from './export-to-xlsx-item';
import { ExportPlayersVoiceItem } from './export-players-voice-item';
import { ExportChatMessagesItem } from './export-chat-messages-item';

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
  const players: MatchTablePlayer[] = [];
  for (const match of matches) {
    checksums.push(match.checksum);
    shareCodes.push(match.shareCode);
    filepaths.push(match.demoFilePath);
    for (const player of match.players) {
      if (!players.some(({ steamId }) => steamId === player.steamId)) {
        players.push(player);
      }
    }
  }

  const onExportToXlsxClick = () => {
    showDialog(<ExportMatchesAsXlsxDialog matches={matches} />);
  };

  return (
    <SubContextMenu label={<Trans context="Context menu">Export</Trans>}>
      <ExportToXlsxItem onClick={onExportToXlsxClick} />
      <ExportMatchesToJsonItem checksums={checksums} />
      <ExportPlayersVoiceItem demoPaths={filepaths} players={players} />
      <ExportChatMessagesItem checksums={checksums} />
    </SubContextMenu>
  );
}
