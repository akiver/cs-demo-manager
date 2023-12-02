import React from 'react';

type Props = {
  id?: string;
  label?: React.ReactNode | undefined;
  name?: string | undefined;
  isChecked?: boolean;
  defaultChecked?: boolean;
  isDisabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
};

export function Checkbox({ id, label, isChecked, isDisabled, ...props }: Props) {
  return (
    <div className="flex flex-none items-center gap-x-8">
      <input
        id={id}
        type="checkbox"
        className="outline-1 outline-gray-900 outline-offset-0"
        checked={isChecked}
        disabled={isDisabled}
        {...props}
      />
      {label !== undefined && <label htmlFor={id}>{label}</label>}
    </div>
  );
}
