import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ErrorCode } from 'csdm/common/error-code';
import type { IgnoredSteamAccount } from 'csdm/common/types/ignored-steam-account';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { addIgnoredSteamAccountSuccess, deleteIgnoredSteamAccountSuccess } from 'csdm/ui/ban/ban-actions';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';

export function useIgnoreSteamAccount() {
  const client = useWebSocketClient();
  const dispatch = useDispatch();

  const getErrorMessageFromError = (error: unknown) => {
    switch (error) {
      case ErrorCode.SteamAccountAlreadyIgnored:
        return <Trans>This account is already ignored.</Trans>;
      case ErrorCode.SteamAccountNotFound:
        return <Trans>Steam account not found.</Trans>;
      case ErrorCode.InvalidSteamCommunityUrl:
        return <Trans>Invalid Steam community URL.</Trans>;
      case ErrorCode.SteamApiForbidden:
        return <Trans>The Steam API returned a forbidden error.</Trans>;
      case ErrorCode.SteamApiTooManyRequests:
        return <Trans>Too many requests sent to the Steam API.</Trans>;
      case ErrorCode.SteamApiError:
        return <Trans>The Steam API returned an error.</Trans>;
      default:
        return <Trans>An error occurred.</Trans>;
    }
  };

  const ignoreSteamAccount = async (steamIdentifier: string) => {
    const account = await client.send({
      name: RendererClientMessageName.AddIgnoredSteamAccount,
      payload: steamIdentifier,
    });
    dispatch(
      addIgnoredSteamAccountSuccess({
        account,
      }),
    );

    return account;
  };

  return {
    ignoreSteamAccount,
    getErrorMessageFromError,
  };
}

export function useRemoveIgnoredSteamAccount() {
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const showToast = useShowToast();

  const removeIgnoredSteamAccount = async (account: IgnoredSteamAccount) => {
    try {
      await client.send({
        name: RendererClientMessageName.DeleteIgnoredSteamAccount,
        payload: account.steamId,
      });
      dispatch(deleteIgnoredSteamAccountSuccess({ account }));
    } catch (error) {
      showToast({
        content: <Trans>An error occurred</Trans>,
        type: 'error',
      });
    }
  };

  return {
    removeIgnoredSteamAccount,
  };
}
