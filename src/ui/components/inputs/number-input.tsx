import React, { useEffect, useId, useRef, type ReactNode } from 'react';

type Props = {
  id?: string;
  name?: string | undefined;
  label?: ReactNode | undefined;
  value?: string | ReadonlyArray<string> | number | undefined;
  defaultValue?: string | ReadonlyArray<string> | number | undefined;
  isDisabled?: boolean;
  placeholder?: string | undefined;
  allowDecimal?: boolean;
  allowNegativeNumber?: boolean;
  focusOnMount?: boolean;
  min?: number;
  max?: number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  maxWidth?: number;
};

export function InputNumber({
  id,
  allowNegativeNumber = false,
  allowDecimal = false,
  isDisabled,
  focusOnMount,
  label,
  ...props
}: Props) {
  const randomId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const isAllowedKey = (key: string) => {
    if (key === '+' || key === 'e') {
      return false;
    }

    if (!allowNegativeNumber && key === '-') {
      return false;
    }

    if (!allowDecimal && (key === '.' || key === ',')) {
      return false;
    }

    return true;
  };

  useEffect(() => {
    if (focusOnMount) {
      setTimeout(() => {
        if (inputRef.current !== null) {
          inputRef.current.focus();
        }
      }, 0);
    }
  }, [focusOnMount]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isAllowedKey(event.key.toLowerCase())) {
      event.preventDefault();
    }
  };

  const input = (
    <input
      ref={inputRef}
      id={id ?? randomId}
      type="number"
      className="appearance-none outline-hidden rounded duration-85 transition-all bg-gray-50 h-[30px] px-12 text-gray-800 border border-gray-300 focus:border-gray-900 placeholder:text-gray-500 disabled:cursor-default disabled:bg-gray-200 disabled:text-gray-500 hover:enabled:focus:border-gray-900 hover:enabled:border-gray-600"
      min={allowNegativeNumber ? undefined : 0}
      onKeyDown={onKeyDown}
      disabled={isDisabled}
      {...props}
    />
  );

  if (label === undefined) {
    return input;
  }

  return (
    <div className="flex flex-col gap-8">
      <label htmlFor={id ?? randomId}>{label}</label>
      <div>{input}</div>
    </div>
  );
}
