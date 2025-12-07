import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { DeleteButton } from 'csdm/ui/components/buttons/delete-button';
import { AccountAvatar } from './account-avatar';
import type { ThirdPartyAccount } from 'csdm/common/types/third-party-account';

type Props<Account extends ThirdPartyAccount> = {
  accounts: Account[];
  getAccountUrl: (account: Account) => string;
  onSetAsCurrentClick: (accountId: string) => Promise<void>;
  onDeleteClick: (accountId: string) => Promise<void>;
  onAddClick: () => void;
};

export function ThirdPartyAccounts<Account extends ThirdPartyAccount>({
  accounts,
  getAccountUrl,
  onSetAsCurrentClick,
  onDeleteClick,
  onAddClick,
}: Props<Account>) {
  function renderAccounts() {
    if (accounts.length === 0) {
      return (
        <p>
          <Trans>No accounts</Trans>
        </p>
      );
    }

    return accounts.map((account) => {
      const avatarSrc = account.avatarUrl === '' ? window.csdm.getDefaultPlayerAvatar() : account.avatarUrl;

      return (
        <div className="flex w-full rounded-8 border border-gray-300 p-8" key={account.id}>
          <a
            className="mr-8 flex w-full items-center gap-x-4"
            href={getAccountUrl(account)}
            target="_blank"
            rel="noreferrer"
          >
            <AccountAvatar url={avatarSrc} playerName={account.nickname} />
            <p className="truncate" title={account.nickname}>
              {account.nickname}
            </p>
          </a>
          <div className="flex items-center gap-x-8">
            <Button
              onClick={async () => {
                await onSetAsCurrentClick(account.id);
              }}
              isDisabled={account.isCurrent}
            >
              <Trans>Set as current account</Trans>
            </Button>
            <DeleteButton
              onClick={async () => {
                await onDeleteClick(account.id);
              }}
            />
          </div>
        </div>
      );
    });
  }

  return (
    <div>
      <h3 className="py-8 text-body-strong">
        <Trans>Accounts</Trans>
      </h3>

      <div className="flex flex-col gap-y-8">
        {renderAccounts()}
        <div>
          <Button variant={ButtonVariant.Primary} onClick={onAddClick}>
            <Trans context="Button">Add account</Trans>
          </Button>
        </div>
      </div>
    </div>
  );
}
