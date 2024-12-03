import type { UpdateMatchDemoLocationPayload } from 'csdm/server/handlers/renderer-process/match/update-match-demo-location-handler';
import type { OpenDialogOptions, OpenDialogReturnValue } from 'electron';
import { useWebSocketClient } from './use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { updateMatchDemoLocationSuccess } from 'csdm/ui/match/match-actions';
import { useLingui } from '@lingui/react/macro';

export function useUpdateDemoLocation() {
  const { t } = useLingui();
  const client = useWebSocketClient();
  const dispatch = useDispatch();

  return async (checksum: string) => {
    const options: OpenDialogOptions = {
      title: t`Select demo's path`,
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

    dispatch(
      updateMatchDemoLocationSuccess({
        checksum,
        demoFilePath: filePath,
      }),
    );

    return filePath;
  };
}
