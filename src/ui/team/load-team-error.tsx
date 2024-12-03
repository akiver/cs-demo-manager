import React from 'react';
import type { ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { Message } from 'csdm/ui/components/message';
import { ErrorCode } from 'csdm/common/error-code';
import { useActiveTeamFilters } from './use-active-team-filters';

type Props = {
  errorCode: ErrorCode;
};

export function LoadTeamError({ errorCode }: Props) {
  const { hasActiveFilter } = useActiveTeamFilters();

  let errorMessage: ReactNode;
  switch (errorCode) {
    case ErrorCode.TeamNotFound: {
      if (hasActiveFilter) {
        errorMessage = <Trans>No data was found with active filters.</Trans>;
        break;
      }
      errorMessage = <Trans>This team is not in any analyzed demos.</Trans>;
      break;
    }
    default:
      errorMessage = <Trans>An error occurred.</Trans>;
  }

  return <Message message={errorMessage} />;
}
