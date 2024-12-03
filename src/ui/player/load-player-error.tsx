import React from 'react';
import type { ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { Message } from '../components/message';
import { useActivePlayerFilters } from './use-active-player-filters';
import { ErrorCode } from 'csdm/common/error-code';

type Props = {
  errorCode: ErrorCode;
};

export function LoadPlayerError({ errorCode }: Props) {
  const { hasActiveFilter } = useActivePlayerFilters();

  let errorMessage: ReactNode;
  switch (errorCode) {
    case ErrorCode.PlayerNotFound: {
      if (hasActiveFilter) {
        errorMessage = <Trans>No data was found with active filters.</Trans>;
        break;
      }
      errorMessage = <Trans>This player is not in any analyzed demos.</Trans>;
      break;
    }
    default:
      errorMessage = <Trans>An error occurred.</Trans>;
  }

  return <Message message={errorMessage} />;
}
