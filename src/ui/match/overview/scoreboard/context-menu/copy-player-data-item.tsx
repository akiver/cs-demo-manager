import React from 'react';
import { Trans } from '@lingui/react/macro';
import { CopySteamIdItem } from 'csdm/ui/components/context-menu/items/copy-steamid-item';
import { CopyCrosshairShareCode } from './copy-crosshair-share-code-item';
import { CopyCrosshairConfig } from './copy-crosshair-config-item';
import { CopyItem } from 'csdm/ui/components/context-menu/items/copy-item';

type Props = {
  steamId: string;
};

export function CopyPlayerDataItem({ steamId }: Props) {
  return (
    <CopyItem>
      <CopySteamIdItem steamIds={[steamId]}>
        <Trans>Steam ID</Trans>
      </CopySteamIdItem>
      <CopyCrosshairShareCode steamId={steamId} />
      <CopyCrosshairConfig steamId={steamId} />
    </CopyItem>
  );
}
