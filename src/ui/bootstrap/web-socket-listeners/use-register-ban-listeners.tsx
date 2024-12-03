import React, { useEffect, type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import type { WebSocketClient } from 'csdm/ui/web-socket-client';
import { ErrorCode } from 'csdm/common/error-code';
import { SharedServerMessageName } from 'csdm/server/shared-server-message-name';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';

export function useRegisterBanListeners(client: WebSocketClient) {
  const showToast = useShowToast();

  useEffect(() => {
    const onCheckForNewBannedAccountsError = (errorCode: ErrorCode) => {
      let message: ReactNode;
      switch (errorCode) {
        case ErrorCode.SteamApiForbidden:
          message = <Trans>The Steam API returned a forbidden error</Trans>;
          break;
        case ErrorCode.SteamApiTooManyRequests:
          message = <Trans>Steam API returned a 429 status code</Trans>;
          break;
        default:
          message = <Trans>An error occurred while checking for new banned Steam accounts (code {errorCode})</Trans>;
      }

      showToast({
        content: message,
        id: 'check-new-banned-accounts-error',
        type: 'error',
      });
    };
    client.on(SharedServerMessageName.NewBannedAccountsError, onCheckForNewBannedAccountsError);

    return () => {
      client.off(SharedServerMessageName.NewBannedAccountsError, onCheckForNewBannedAccountsError);
    };
  });
}
