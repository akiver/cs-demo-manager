import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { SaveDialogReturnValue, SaveDialogOptions } from 'electron';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import type { WriteBase64FilePayload } from 'csdm/server/handlers/renderer-process/filesystem/write-base64-file-handler';
import { useShowToast } from '../toasts/use-show-toast';

function buildImageBase64() {
  const radarCanvas = document.getElementById('radar-canvas') as HTMLCanvasElement | null;
  if (radarCanvas === null) {
    throw new Error('Radar canvas is not initialized');
  }
  const heatmapCanvas = document.getElementById('heatmap-canvas') as HTMLCanvasElement | null;
  if (heatmapCanvas === null) {
    throw new Error('Heatmap canvas is not initialized');
  }

  const canvas = document.createElement('canvas');
  canvas.width = radarCanvas.width;
  canvas.height = radarCanvas.height;
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  context.drawImage(radarCanvas, 0, 0);
  context.drawImage(heatmapCanvas, 0, 0);

  return canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
}

export function ExportHeatmapButton() {
  const client = useWebSocketClient();
  const { t } = useLingui();
  const showToast = useShowToast();

  const onClick = async () => {
    const options: SaveDialogOptions = {
      defaultPath: `heatmap-${Date.now()}.png`,
      title: t({
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

      showToast({
        id: 'heatmap-exported',
        content: <Trans context="Toast">Heatmap exported, click here to reveal the file</Trans>,
        type: 'success',
        onClick: () => {
          window.csdm.browseToFile(filePath);
        },
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
