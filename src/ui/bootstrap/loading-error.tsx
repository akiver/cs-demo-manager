import React, { type ReactNode } from 'react';
import { ExclamationTriangleIcon } from '../icons/exclamation-triangle-icon';

type Props = {
  title: ReactNode;
  error: string;
};

export function LoadingError({ title, error }: Props) {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div>
        <div className="flex items-center gap-x-8">
          <ExclamationTriangleIcon className="size-24 text-red-700" />
          <p className="text-title">{title}</p>
        </div>
        <p className="mt-8 text-body-strong select-text">{error}</p>
      </div>
    </div>
  );
}
