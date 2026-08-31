import type { Demo } from 'csdm/common/types/demo';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from './use-web-socket-client';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { useLingui } from '@lingui/react/macro';
import { ErrorCode } from 'csdm/common/error-code';
import { buildUiDatabaseOperationError } from 'csdm/ui/shared/format-error';

export function useAddDemosToAnalyses() {
  const client = useWebSocketClient();
  const showToast = useShowToast();
  const { t } = useLingui();

  return async (demos: Demo[]) => {
    try {
      const error = await client.send({
        name: RendererClientMessageName.AddDemosToAnalyses,
        payload: demos,
      });
      if (error !== undefined) {
        showToast({
          type: 'error',
          content:
            error.code === ErrorCode.DatabaseTransitionInProgress
              ? t`Demos cannot be added while the database is being changed.`
              : error.message,
        });
      }
    } catch (error) {
      showToast({
        type: 'error',
        content: buildUiDatabaseOperationError(error, t`Unknown error`).message,
      });
    }
  };
}
