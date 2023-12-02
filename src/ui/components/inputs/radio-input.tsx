import React from 'react';
import type { ReactNode } from 'react';

type Props = {
  id: string;
  name: string;
  value: string;
  defaultChecked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label: ReactNode;
};

export function RadioInput({ label, ...props }: Props) {
  return (
    <div className="flex items-center gap-4">
      <input type="radio" {...props} />
      <label htmlFor={props.id}>{label}</label>
    </div>
  );
}
