import React from 'react';
import { Trans } from '@lingui/macro';
import { Tooltip } from 'csdm/ui/components/tooltip';

type CircleProps = {
  className: string;
};

const Circle = React.forwardRef(function Circle({ className }: CircleProps, ref: React.Ref<HTMLDivElement>) {
  return <div ref={ref} className={`size-8 rounded-full ${className}`} />;
});

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
