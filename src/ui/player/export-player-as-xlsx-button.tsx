import React from 'react';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { ExportPlayersToXlsxDialog } from '../players/table/export-players-to-xlsx-dialog';
import { usePlayerProfileSettings } from '../settings/use-player-profile-settings';
import { XlsxExportButton } from '../components/buttons/xlsx-export-button';
import { useUnsafePlayer } from './use-unsafe-player';
import { usePlayerState } from './use-player-state';
import { Status } from 'csdm/common/types/status';

export function ExportPlayerAsXlsxButton() {
  const player = useUnsafePlayer();
  const { status } = usePlayerState();
  const { showDialog } = useDialog();
  const filters = usePlayerProfileSettings();

  if (!player || status === Status.Error) {
    return null;
  }

  const onClick = () => {
    showDialog(<ExportPlayersToXlsxDialog steamIds={[player.steamId]} filters={filters} />);
  };

  return <XlsxExportButton onClick={onClick} />;
}
