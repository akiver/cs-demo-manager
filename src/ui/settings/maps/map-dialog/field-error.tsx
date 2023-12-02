import React from 'react';

type Props = {
  error?: string | undefined;
};

export function FieldError({ error }: Props) {
  if (error === undefined) {
    return null;
  }

  return <p className="text-red-600">{error}</p>;
}
