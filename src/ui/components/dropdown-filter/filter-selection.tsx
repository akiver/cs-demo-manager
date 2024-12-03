import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ActiveFilterIndicator } from './active-filter-indicator';

type ButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
};

function Button({ children, onClick }: ButtonProps) {
  return (
    <button className="text-caption cursor-auto hover:text-gray-900" onClick={onClick}>
      {children}
    </button>
  );
}

type Props = {
  onSelectAllClick: () => void;
  onDeselectAllClick: () => void;
  hasActiveFilter?: boolean;
};

export function FilterSelection({ hasActiveFilter, onDeselectAllClick, onSelectAllClick }: Props) {
  return (
    <div className="flex items-center gap-x-8 pr-4">
      {hasActiveFilter && <ActiveFilterIndicator />}
      <Button onClick={onSelectAllClick}>
        <Trans context="Button filter">All</Trans>
      </Button>
      <Button onClick={onDeselectAllClick}>
        <Trans context="Button filter">None</Trans>
      </Button>
    </div>
  );
}
