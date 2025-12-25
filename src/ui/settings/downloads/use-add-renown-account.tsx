import React, { useState, type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { ErrorCode } from 'csdm/common/error-code';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { accountAdded } from 'csdm/ui/downloads/renown/renown-actions';

export function useAddRenownAccount() {
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState<ReactNode | undefined>(undefined);
  const [isBusy, setIsBusy] = useState(false);

  const addAccount = async (steamId: string) => {
    try {
      if (steamId === '') {
        return false;
      }

      setIsBusy(true);
      const account = await client.send({
        name: RendererClientMessageName.AddRenownAccount,
        payload: steamId,
      });
      dispatch(accountAdded({ account }));

      setIsBusy(false);
      return true;
    } catch (error) {
      let errorMessage: ReactNode;
      switch (error) {
        case ErrorCode.RenownApiResourceNotFound:
          errorMessage = <Trans>Player not found.</Trans>;
          break;
        case ErrorCode.RenownApiError:
          errorMessage = <Trans>The API returned an error, please re-try later.</Trans>;
          break;
        default:
          errorMessage = <Trans>An error occurred.</Trans>;
      }

      setErrorMessage(errorMessage);
      setIsBusy(false);
      return false;
    }
  };

  return { addAccount, isBusy, errorMessage };
}
