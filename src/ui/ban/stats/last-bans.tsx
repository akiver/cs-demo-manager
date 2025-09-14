import React from 'react';
import { Link } from 'react-router';
import { Trans } from '@lingui/react/macro';
import type { BannedSteamAccount } from 'csdm/common/types/banned-steam-account';
import { Panel, PanelTitle } from 'csdm/ui/components/panel';
import { Avatar } from 'csdm/ui/components/avatar';
import { buildPlayerPath } from 'csdm/ui/routes-paths';
import { useFormatDate } from 'csdm/ui/hooks/use-format-date';
import { NoBanMessage } from './no-ban-message';

type Props = {
  bannedAccounts: BannedSteamAccount[];
};

export function LastBans({ bannedAccounts }: Props) {
  const formatDate = useFormatDate();

  return (
    <Panel
      header={
        <PanelTitle>
          <Trans>Last bans</Trans>
        </PanelTitle>
      }
    >
      <div className="flex gap-x-8">
        {bannedAccounts.length === 0 ? (
          <NoBanMessage />
        ) : (
          bannedAccounts.slice(0, 8).map((account) => {
            return (
              <Link
                key={account.steamId}
                className="flex flex-none gap-x-4 rounded p-8 hover:bg-gray-100"
                to={buildPlayerPath(account.steamId)}
                viewTransition={true}
              >
                <Avatar avatarUrl={account.avatar} playerName={account.name} size={48} />
                <div className="flex flex-col justify-center">
                  <p className="text-body-strong">{account.name}</p>
                  <p>
                    {formatDate(account.lastBanDate, {
                      hour: undefined,
                      minute: undefined,
                      second: undefined,
                    })}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </Panel>
  );
}
