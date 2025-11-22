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
  const location = useLocation();
  const [{ count, lastPathname }, setBanData] = useState({ count: 0, lastPathname: location.pathname });
  const client = useWebSocketClient();

  useEffect(() => {
    const onNewBannedAccounts = (steamIds: string[]) => {
      setBanData((prevState) => ({ ...prevState, count: steamIds.length }));
    };

    client.on(SharedServerMessageName.NewBannedAccounts, onNewBannedAccounts);

    return () => {
      client.off(SharedServerMessageName.NewBannedAccounts, onNewBannedAccounts);
    };
  }, [client]);

  const currentPathname = location.pathname;
  if (currentPathname !== lastPathname) {
    // reset the counter only when navigating away from the bans page
    const shouldReset = lastPathname === RoutePath.Ban && currentPathname !== RoutePath.Ban;
    setBanData((prev) => ({
      count: shouldReset ? 0 : prev.count,
      lastPathname: currentPathname,
    }));
  }

  return (
    <LeftBarLink
      icon={
        <div className="relative size-full">
          <BanCountBadge banCount={count} />
          <ShieldIcon />
        </div>
      }
      tooltip={<Trans context="Tooltip">VAC bans</Trans>}
      url={RoutePath.Ban}
    />
  );
}
