import React from 'react';

type Props = {
  max?: number;
  value: number;
};

export function Progress({ max = 100, value }: Props) {
  return (
    <progress max={max} value={value}>
      {`${value}%`}
    </progress>
  );
}
