import React from 'react';
import { useFormatDate } from 'csdm/ui/hooks/use-format-date';
import { Tooltip } from 'csdm/ui/components/tooltip';

type Props = {
  date: string;
};

export function MatchDate({ date }: Props) {
  const formatDate = useFormatDate();

  return (
    <Tooltip content={formatDate(date, { timeZone: 'UTC' })}>
      <p>
        {formatDate(date, {
          hour: undefined,
          minute: undefined,
          second: undefined,
          timeZone: 'UTC',
        })}
      </p>
    </Tooltip>
  );
}
