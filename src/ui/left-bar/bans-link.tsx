import React, { useEffect, useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { LeftBarLink } from 'csdm/ui/left-bar/left-bar-link';
import { RoutePath } from 'csdm/ui/routes-paths';
import { ShieldIcon } from '../icons/shield-icon';
import { useWebSocketClient } from '../hooks/use-web-socket-client';
import { useLocation } from 'react-router';
import { SharedServerMessageName } from 'csdm/server/shared-server-message-name';
import { LeftBarBadge } from './left-bar-badge';
import { NumberBadge } from '../components/number-badge';

function BanCountBadge({ banCount }: { banCount: number }) {
  return (
    <LeftBarBadge>
      <NumberBadge number={banCount} />
    </LeftBarBadge>
  );
}

export function BansLink() {
  const [newBannedAccountCount, setNewBannedAccountCount] = useState(0);
  const client = useWebSocketClient();
  const location = useLocation();

  useEffect(() => {
    const onNewBannedAccounts = (steamIds: string[]) => {
      setNewBannedAccountCount(steamIds.length);
    };

    client.on(SharedServerMessageName.NewBannedAccounts, onNewBannedAccounts);

    return () => {
      client.off(SharedServerMessageName.NewBannedAccounts, onNewBannedAccounts);
    };
  }, [client]);

  useEffect(() => {
    if (location.pathname === RoutePath.Ban) {
      setNewBannedAccountCount(0);
    }
  }, [location.pathname]);

  return (
    <LeftBarLink
      icon={
        <div className="relative size-full">
          <BanCountBadge banCount={newBannedAccountCount} />
          <ShieldIcon />
        </div>
      }
      tooltip={<Trans context="Tooltip">VAC bans</Trans>}
      url={RoutePath.Ban}
    />
  );
}
