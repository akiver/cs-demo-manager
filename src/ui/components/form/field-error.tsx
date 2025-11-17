import React, { type ReactNode } from 'react';

type Props = {
  error?: ReactNode | undefined;
};

export function FieldError({ error }: Props) {
  if (!error) {
    return null;
  }

  return <p className="text-red-600">{error}</p>;
}
