import React, { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useShowToast } from '../../toasts/use-show-toast';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import type { ExportMatchesChatMessagesPayload } from 'csdm/server/handlers/renderer-process/match/export-matches-chat-messages-handler';
import { useExportMatchChatMessages } from 'csdm/ui/hooks/use-export-match-chat-messages';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { Button } from 'csdm/ui/components/buttons/button';
import { ConfirmButton } from 'csdm/ui/components/buttons/confirm-button';
import { CancelButton } from 'csdm/ui/components/buttons/cancel-button';
import { PlayersSelect } from '../../inputs/select/players-select';
import type { MatchTablePlayer } from 'csdm/common/types/match-table';

type SelectPlayersDialogProps = {
  players: MatchTablePlayer[];
  onConfirm: (steamIds: string[]) => void;
};

function SelectPlayersDialog({ players, onConfirm }: SelectPlayersDialogProps) {
  const { hideDialog } = useDialog();
  const [steamIds, setSteamIds] = useState<string[]>([]);

  return (
    <Dialog>
      <div className="w-[768px]">
        <DialogHeader>
          <DialogTitle>
            <Trans>Chat messages export</Trans>
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="flex flex-col gap-y-8">
            <p>
              <Trans>Select the players whose chat messages you want to export.</Trans>
            </p>
            <div className="max-h-[220px] overflow-auto">
              <PlayersSelect players={players} selectedSteamIds={steamIds} onChange={setSteamIds} filter={null} />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button
            onClick={() => {
              onConfirm([]);
            }}
          >
            <Trans context="Button">Export all players</Trans>
          </Button>
          <ConfirmButton
            onClick={() => {
              onConfirm(steamIds);
            }}
            isDisabled={steamIds.length === 0}
          />
          <CancelButton onClick={hideDialog} />
        </DialogFooter>
      </div>
    </Dialog>
  );
}

type Props = {
  checksums: string[];
  players?: MatchTablePlayer[];
};

export function ExportChatMessagesItem({ checksums, players }: Props) {
  const { t } = useLingui();
  const client = useWebSocketClient();
  const showToast = useShowToast();
  const exportChatMessages = useExportMatchChatMessages();
  const { showDialog, hideDialog } = useDialog();

  const exportChatMessagesForSteamIds = async (steamIds: string[]) => {
    if (checksums.length === 1) {
      return exportChatMessages(checksums[0], undefined, steamIds);
    }

    const { filePaths, canceled } = await window.csdm.showOpenDialog({
      buttonLabel: t({
        context: 'Button label',
        message: 'Select',
      }),
      properties: ['openDirectory'],
    });

    if (canceled || filePaths.length === 0) {
      return;
    }

    const outputFolderPath = filePaths[0];

    try {
      const payload: ExportMatchesChatMessagesPayload = {
        checksums,
        outputFolderPath,
        steamIds,
      };
      const hasExportedAtLeastOneMatch = await client.send({
        name: RendererClientMessageName.ExportMatchesChatMessages,
        payload,
      });

      if (hasExportedAtLeastOneMatch) {
        showToast({
          content: <Trans context="Toast">Chat messages exported, click here to reveal the folder</Trans>,
          type: 'success',
          onClick: () => {
            window.csdm.browseToFolder(outputFolderPath);
          },
        });
      } else {
        showToast({
          content: <Trans>No chat messages to export</Trans>,
          type: 'warning',
        });
      }
    } catch (error) {
      showToast({
        content: <Trans>An error occurred</Trans>,
        type: 'error',
      });
    }
  };

  const onClick = () => {
    if (players && players.length > 0) {
      showDialog(
        <SelectPlayersDialog
          players={players}
          onConfirm={(steamIds) => {
            hideDialog();
            void exportChatMessagesForSteamIds(steamIds);
          }}
        />,
      );
    } else {
      void exportChatMessagesForSteamIds([]);
    }
  };

  return (
    <ContextMenuItem onClick={onClick} isDisabled={checksums.length === 0}>
      <Trans context="Context menu">Chat messages</Trans>
    </ContextMenuItem>
  );
}
