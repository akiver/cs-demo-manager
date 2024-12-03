import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { MatchResult } from 'csdm/ui/downloads/match-result';
import { assertNever } from 'csdm/common/assert-never';

type Props = {
  result: MatchResult;
};

export function MatchResultText({ result }: Props) {
  let text: ReactNode;
  let className: string;

  switch (result) {
    case MatchResult.Defeat:
      text = <Trans>Defeat</Trans>;
      className = 'text-red-400';
      break;
    case MatchResult.Victory:
      text = <Trans>Victory</Trans>;
      className = 'text-green-400';
      break;
    case MatchResult.Tied:
      text = <Trans>Tied</Trans>;
      className = 'text-blue-400';
      break;
    case MatchResult.Unplayed:
      text = <Trans>Unplayed</Trans>;
      className = 'text-gray-800';
      break;
    default:
      assertNever(result, 'Unknown match result');
  }

  return <p className={`text-caption ${className}`}>{text}</p>;
}
