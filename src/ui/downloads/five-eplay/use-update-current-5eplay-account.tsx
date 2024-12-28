import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { accountsUpdated } from './5eplay-actions';

export function useUpdateCurrent5EPlayAccount() {
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const showToast = useShowToast();

  return async (accountId: string) => {
    try {
      const accounts = await client.send({
        name: RendererClientMessageName.UpdateCurrent5EPlayAccount,
        payload: accountId,
      });
      dispatch(accountsUpdated({ accounts }));
    } catch (error) {
      showToast({
        content: <Trans>An error occurred</Trans>,
        id: 'update-current-5eplay-account-error',
        type: 'error',
      });
    }
  };
}
