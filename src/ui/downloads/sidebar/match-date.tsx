import React from 'react';
import { useFormatDate } from 'csdm/ui/hooks/use-format-date';

type Props = {
  date: string;
};

export function MatchDate({ date }: Props) {
  const formatDate = useFormatDate();

  const humanizedDate = formatDate(date, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  return <p>{humanizedDate}</p>;
}
