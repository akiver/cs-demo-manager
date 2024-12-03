import React from 'react';
import { Trans } from '@lingui/react/macro';
import { DemoField } from './demo-field';
import { useFormatDate } from 'csdm/ui/hooks/use-format-date';

type Props = {
  date: string;
};

export function DemoDate({ date }: Props) {
  const formatDate = useFormatDate();

  return (
    <DemoField
      label={<Trans>Date:</Trans>}
      value={formatDate(date, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      })}
    />
  );
}
