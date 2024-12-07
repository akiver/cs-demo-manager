import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Tooltip } from 'csdm/ui/components/tooltip';

type CircleProps = {
  ref?: React.Ref<HTMLDivElement>;
  className: string;
};

function Circle({ ref, className }: CircleProps) {
  return <div ref={ref} className={`size-8 rounded-full ${className}`} />;
}

type Props = {
  showVacBanned: boolean;
  showGameBanned: boolean;
  showCommunityBanned: boolean;
};

export function BansCell({ showVacBanned, showGameBanned, showCommunityBanned }: Props) {
  return (
    <div className="flex flex-col items-center gap-y-4">
      {showVacBanned && (
        <Tooltip content={<Trans context="Tooltip">VAC banned</Trans>} renderInPortal={true}>
          <Circle className="bg-vac-ban" />
        </Tooltip>
      )}
      {showGameBanned && (
        <Tooltip content={<Trans context="Tooltip">Game banned</Trans>} renderInPortal={true}>
          <Circle className="bg-game-ban" />
        </Tooltip>
      )}
      {showCommunityBanned && (
        <Tooltip content={<Trans context="Tooltip">Community banned</Trans>} renderInPortal={true}>
          <Circle className="bg-community-ban" />
        </Tooltip>
      )}
    </div>
  );
}
