import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';
import React from 'react';

type Props = {
  message: React.ReactNode;
};

export function ErrorMessage({ message }: Props) {
  return (
    <div className="flex items-center gap-x-8">
      <ExclamationTriangleIcon className="size-20 text-red-700" />
      <p className="leading-none">{message}</p>
    </div>
  );
}
