import type { UpdateMatchDemoLocationPayload } from 'csdm/server/handlers/renderer-process/match/update-match-demo-location-handler';
import type { OpenDialogOptions, OpenDialogReturnValue } from 'electron';
import { useWebSocketClient } from './use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';

export function useUpdateDemoLocation() {
  const client = useWebSocketClient();

  return async (checksum: string) => {
    const options: OpenDialogOptions = {
      title: `Select demo's path`,
      filters: [{ name: '*', extensions: ['dem'] }],
      properties: ['openFile'],
    };
    const { canceled, filePaths }: OpenDialogReturnValue = await window.csdm.showOpenDialog(options);
    if (canceled || filePaths.length === 0) {
      return;
    }
    const [filePath] = filePaths;
    const payload: UpdateMatchDemoLocationPayload = {
      checksum,
      demoFilePath: filePath,
    };
    await client.send({
      name: RendererClientMessageName.UpdateMatchDemoLocation,
      payload,
    });

    return filePath;
  };
}
