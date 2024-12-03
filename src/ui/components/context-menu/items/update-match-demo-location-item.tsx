import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import type { MatchTable } from 'csdm/common/types/match-table';
import { useShowToast } from '../../toasts/use-show-toast';
import { useUpdateDemoLocation } from 'csdm/ui/hooks/use-update-demo-location';
import { ErrorCode } from 'csdm/common/error-code';

type Props = {
  matches: MatchTable[];
};

export function UpdateMatchDemoLocationItem({ matches }: Props) {
  const showToast = useShowToast();
  const updateDemoLocation = useUpdateDemoLocation();

  const onClick = async () => {
    try {
      const match = matches[0];
      await updateDemoLocation(match.checksum);
    } catch (error) {
      if (error === ErrorCode.ChecksumsMismatch) {
        showToast({
          content: <Trans>This demo is not the same as the one of the match</Trans>,
          type: 'error',
        });
      } else {
        showToast({
          content: <Trans>An error occurred</Trans>,
          type: 'error',
        });
      }
    }
  };

  return (
    <ContextMenuItem onClick={onClick} isDisabled={matches.length !== 1}>
      <Trans context="Context menu">Update demo location</Trans>
    </ContextMenuItem>
  );
}
