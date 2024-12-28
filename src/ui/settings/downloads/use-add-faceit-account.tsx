import React, { useState, type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { ErrorCode } from 'csdm/common/error-code';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { accountAdded } from '../../downloads/faceit/faceit-actions';

export function useAddFaceitAcount() {
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState<ReactNode | undefined>(undefined);
  const [isBusy, setIsBusy] = useState(false);

  const addFaceitAccount = async (nickname: string) => {
    try {
      if (nickname === '') {
        return false;
      }

      setIsBusy(true);
      const account = await client.send({
        name: RendererClientMessageName.AddFaceitAccount,
        payload: nickname,
      });
      dispatch(accountAdded({ account }));

      return true;
    } catch (error) {
      let errorMessage: ReactNode;
      switch (error) {
        case ErrorCode.FaceItApiResourceNotFound:
          errorMessage = <Trans>Player not found.</Trans>;
          break;
        case ErrorCode.FaceItApiError:
          errorMessage = <Trans>The API returned an error, please re-try later.</Trans>;
          break;
        case ErrorCode.FaceItApiForbidden:
          errorMessage = <Trans>The API returned a forbidden error, please check your API key.</Trans>;
          break;
        case ErrorCode.FaceItApiInvalidRequest:
          errorMessage = <Trans>Invalid API request.</Trans>;
          break;
        case ErrorCode.FaceItApiUnauthorized:
          errorMessage = <Trans>The API returned a 401 code, please check you API key.</Trans>;
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

  return { addFaceitAccount, isBusy, errorMessage };
}
