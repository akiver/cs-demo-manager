import React, { useState, type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { ErrorCode } from 'csdm/common/error-code';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { accountAdded } from 'csdm/ui/downloads/five-eplay/5eplay-actions';

export function useAdd5EPlayAcount() {
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState<ReactNode | undefined>(undefined);
  const [isBusy, setIsBusy] = useState(false);

  const add5EPlayAccount = async (domainId: string) => {
    try {
      if (domainId === '') {
        return false;
      }

      setIsBusy(true);
      const account = await client.send({
        name: RendererClientMessageName.Add5EPlayAccount,
        payload: domainId,
      });
      dispatch(accountAdded({ account }));

      return true;
    } catch (error) {
      let errorMessage: ReactNode;
      switch (error) {
        case ErrorCode.FiveEPlayApiResourceNotFound:
          errorMessage = <Trans>Player not found.</Trans>;
          break;
        case ErrorCode.FiveEPlayApiInvalidRequest:
          errorMessage = <Trans>Invalid API request.</Trans>;
          break;
        default:
          errorMessage = <Trans>An error occurred.</Trans>;
      }

      setErrorMessage(errorMessage);
      return false;
    } finally {
      setIsBusy(false);
    }
  };

  return { add5EPlayAccount, isBusy, errorMessage };
}
