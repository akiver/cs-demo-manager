import React from 'react';
import { Trans } from '@lingui/macro';
import type { SaveDialogReturnValue, SaveDialogOptions } from 'electron';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import type { WriteBase64FilePayload } from 'csdm/server/handlers/renderer-process/filesystem/write-base64-file-handler';
import { useHeatmapContext } from './heatmap-context';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

export function HeatmapExportButton() {
  const client = useWebSocketClient();
  const { buildImageBase64 } = useHeatmapContext();
  const _ = useI18n();

  const onClick = async () => {
    const options: SaveDialogOptions = {
      defaultPath: `heatmap-${Date.now()}.png`,
      title: _({
        id: 'os.dialogTitle.exportAsPNG',
        message: 'Export as PNG',
      }),
      filters: [{ name: 'PNG', extensions: ['png'] }],
    };
    const { canceled, filePath }: SaveDialogReturnValue = await window.csdm.showSaveDialog(options);
    if (!canceled && filePath) {
      const base64 = buildImageBase64();
      const payload: WriteBase64FilePayload = {
        filePath,
        data: base64,
      };

      client.send({
        name: RendererClientMessageName.WriteBase64File,
        payload,
      });
    }
  };

  return (
    <div>
      <Button onClick={onClick} variant={ButtonVariant.Primary}>
        <Trans context="Button">Export</Trans>
      </Button>
    </div>
  );
}
