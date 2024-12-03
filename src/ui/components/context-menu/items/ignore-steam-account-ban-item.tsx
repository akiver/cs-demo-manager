import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { useIgnoredSteamAccounts } from 'csdm/ui/ban/use-ignored-steam-accounts';
import { useIgnoreSteamAccount, useRemoveIgnoredSteamAccount } from 'csdm/ui/settings/bans/use-ignored-steam-account';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';

type Props = {
  steamId: string;
};

export function IgnoreSteamAccountBanItem({ steamId }: Props) {
  const ignoredAccounts = useIgnoredSteamAccounts();
  const account = ignoredAccounts.find((account) => account.steamId === steamId);
  const { ignoreSteamAccount, getErrorMessageFromError } = useIgnoreSteamAccount();
  const { removeIgnoredSteamAccount } = useRemoveIgnoredSteamAccount();
  const showToast = useShowToast();

  if (account) {
    return (
      <ContextMenuItem
        onClick={() => {
          removeIgnoredSteamAccount(account);
        }}
      >
        <Trans context="Context menu">Stop ignoring player's bans</Trans>
      </ContextMenuItem>
    );
  }

  return (
    <ContextMenuItem
      onClick={async () => {
        try {
          await ignoreSteamAccount(steamId);
          showToast({
            content: <Trans>Steam account added to ignored list</Trans>,
          });
        } catch (error) {
          const errorMessage = getErrorMessageFromError(error);
          showToast({
            content: errorMessage,
          });
        }
      }}
    >
      <Trans context="Context menu">Ignore player's bans</Trans>
    </ContextMenuItem>
  );
}
