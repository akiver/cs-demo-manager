import React, { useId } from 'react';

type Props = {
  label?: React.ReactNode | undefined;
  name?: string | undefined;
  isChecked?: boolean;
  defaultChecked?: boolean;
  isDisabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
};

export function Checkbox({ label, isChecked, isDisabled, ...props }: Props) {
  const id = useId();

  return (
    <div className="flex flex-none items-center gap-x-8">
      <input
        id={id}
        type="checkbox"
        className="outline-offset-0 outline-gray-800 focus-visible:outline"
        checked={isChecked}
        disabled={isDisabled}
        {...props}
      />
      {label && <label htmlFor={id}>{label}</label>}
    </div>
  );
}
