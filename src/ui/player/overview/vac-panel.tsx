import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Panel, PanelRow, PanelTitle, PanelValue } from 'csdm/ui/components/panel';
import { usePlayer } from '../use-player';
import { useTranslateEconomyBan } from 'csdm/ui/hooks/use-translate-economy-ban';
import { ShieldIcon } from 'csdm/ui/icons/shield-icon';
import { useFormatDate } from 'csdm/ui/hooks/use-format-date';
import { useBooleanHuman } from 'csdm/ui/hooks/use-boolean-to-human';

export function VacPanel() {
  const { vacBanCount, gameBanCount, lastBanDate, economyBan, hasPrivateProfile, isCommunityBanned } = usePlayer();
  const formatDate = useFormatDate();
  const translateEconomyBan = useTranslateEconomyBan();
  const isBanned = lastBanDate !== null;
  const booleanToHuman = useBooleanHuman();

  return (
    <Panel
      header={
        <div className="flex items-center justify-between">
          <PanelTitle>
            <Trans context="Panel title">VAC</Trans>
          </PanelTitle>
          {isBanned && <ShieldIcon width={20} height={20} className="text-red-600" />}
        </div>
      }
      minWidth={220}
    >
      <PanelRow>
        <p>
          <Trans context="Panel label">Bans</Trans>
        </p>
        <PanelValue>{vacBanCount}</PanelValue>
      </PanelRow>
      <PanelRow>
        <p>
          <Trans context="Panel label">Game bans</Trans>
        </p>
        <PanelValue>{gameBanCount}</PanelValue>
      </PanelRow>
      <PanelRow>
        <p>
          <Trans context="Panel label">Last ban date</Trans>
        </p>
        {lastBanDate && (
          <PanelValue>
            {formatDate(lastBanDate, {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
            })}
          </PanelValue>
        )}
      </PanelRow>
      <PanelRow>
        <p>
          <Trans context="Panel label">Economy ban</Trans>
        </p>
        <PanelValue>{translateEconomyBan(economyBan)}</PanelValue>
      </PanelRow>
      <PanelRow>
        <p>
          <Trans context="Panel label">Community banned</Trans>
        </p>
        <PanelValue>{booleanToHuman(isCommunityBanned)}</PanelValue>
      </PanelRow>
      <PanelRow>
        <p>
          <Trans context="Panel label">Profile</Trans>
        </p>
        <PanelValue>{hasPrivateProfile ? <Trans>Private</Trans> : <Trans>Public</Trans>}</PanelValue>
      </PanelRow>
    </Panel>
  );
}
