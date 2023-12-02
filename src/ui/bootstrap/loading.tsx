import React from 'react';
import { Spinner } from '../components/spinner';

export function Loading() {
  return (
    <div className="flex items-center justify-center h-full">
      <Spinner size={70} />
    </div>
  );
}
