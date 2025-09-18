import React from 'react';
import { Spinner } from '../components/spinner';

export function Loading() {
  return (
    <div className="flex h-full items-center justify-center">
      <Spinner size={70} />
    </div>
  );
}
