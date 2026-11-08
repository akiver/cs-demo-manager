import React, { type ReactNode } from 'react';
import { Switch } from 'csdm/ui/components/inputs/switch';

type Props = {
  id: string;
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
  children: ReactNode;
};

export function SettingSwitch({ id, isChecked, onChange, children }: Props) {
  return (
    <div className="flex items-center justify-between gap-x-8">
      <label htmlFor={id} className="cursor-pointer">
        {children}
      </label>
      <Switch id={id} isChecked={isChecked} onChange={onChange} />
    </div>
  );
}
