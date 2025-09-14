import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import { useClipboard } from 'csdm/ui/hooks/use-clipboard';

type Props = {
  label: ReactNode;
  value: ReactNode;
  isCopyable?: boolean;
};

export function DemoField({ label, value, isCopyable }: Props) {
  const { copyToClipboard } = useClipboard();

  const onClick = () => {
    if (isCopyable) {
      copyToClipboard(String(value));
    }
  };

  return (
    <div className="flex flex-col">
      <p>{label}</p>
      <p
        className={clsx('text-body-strong break-all', isCopyable ? 'cursor-pointer select-text' : 'selectable')}
        onClick={onClick}
      >
        {value}
      </p>
    </div>
  );
}
