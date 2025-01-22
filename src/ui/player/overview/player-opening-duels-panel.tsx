import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Panel, PanelRow, PanelTitle, PanelValue } from 'csdm/ui/components/panel';
import { usePlayer } from '../use-player';
import { WEAPONS_ICONS } from 'csdm/ui/components/weapons-icons';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { WeaponName } from '@akiver/cs-demo-analyzer';

export function PlayerOpeningDuelsStats() {
  const player = usePlayer();
  const { successPercentage, tradePercentage, bestWeapon } = player.openingDuelsStats;
  const WeaponIcon = WEAPONS_ICONS[bestWeapon];

  return (
    <Panel
      header={
        <PanelTitle>
          <Trans context="Panel title">Opening duels</Trans>
        </PanelTitle>
      }
    >
      <PanelRow>
        <p>{<Trans context="Panel label">Success</Trans>}</p>
        <PanelValue>{`${successPercentage}%`}</PanelValue>
      </PanelRow>
      <PanelRow>
        <p>{<Trans context="Panel label">Traded</Trans>}</p>
        <PanelValue>{`${tradePercentage}%`}</PanelValue>
      </PanelRow>
      {WeaponIcon && (
        <PanelRow>
          <p>{<Trans context="Panel label">Best weapon</Trans>}</p>
          <Tooltip content={bestWeapon}>
            <div>
              <PanelValue>{bestWeapon === WeaponName.Unknown ? '-' : <WeaponIcon className="h-20" />}</PanelValue>
            </div>
          </Tooltip>
        </PanelRow>
      )}
    </Panel>
  );
}
