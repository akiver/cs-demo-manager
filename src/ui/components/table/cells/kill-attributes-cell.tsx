import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { Kill } from 'csdm/common/types/kill';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { HeadshotIcon } from 'csdm/ui/icons/headshot-icon';
import { PenetrateIcon } from 'csdm/ui/icons/penetrate-icon';
import { BlindIcon } from 'csdm/ui/icons/blind-icon';
import { JumpIcon } from 'csdm/ui/icons/jump-icon';

type Props = {
  data: Kill;
};

export function KillAttributesCell({ data: kill }: Props) {
  const iconSize = 24;
  return (
    <div className="flex px-4 gap-x-4">
      {kill.isHeadshot && (
        <Tooltip content={<Trans context="Tooltip kill">Headshot</Trans>}>
          <HeadshotIcon height={iconSize} />
        </Tooltip>
      )}
      {kill.penetratedObjects > 0 && (
        <Tooltip content={<Trans context="Tooltip kill">Wallbang</Trans>}>
          <PenetrateIcon height={iconSize} />
        </Tooltip>
      )}
      {kill.isKillerBlinded && (
        <Tooltip content={<Trans context="Tooltip kill">Blinded</Trans>}>
          <BlindIcon height={iconSize} />
        </Tooltip>
      )}
      {kill.isKillerAirborne && (
        <Tooltip content={<Trans context="Tooltip kill">Jump kill</Trans>}>
          <JumpIcon height={iconSize} />
        </Tooltip>
      )}
    </div>
  );
}
