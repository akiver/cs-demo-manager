import React, { useEffect, useRef, useImperativeHandle, useId } from 'react';

export type TextInputHandlers = {
  focus: () => void;
  blur: () => void;
  setValue: (value: string) => void;
  value: () => string;
};

type Props = {
  ref?: React.Ref<TextInputHandlers>;
  name?: string | undefined;
  label?: React.ReactNode | undefined;
  value?: string | ReadonlyArray<string> | number | undefined;
  defaultValue?: string | ReadonlyArray<string> | number | undefined;
  placeholder?: string | undefined;
  type?: 'password' | 'search';
  isDisabled?: boolean;
  isReadOnly?: boolean;
  autoFocus?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEnterKeyDown?: (event: React.KeyboardEvent) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};

export function TextInput({
  isDisabled,
  isReadOnly,
  autoFocus,
  onEnterKeyDown,
  label,
  onKeyDown,
  ref,
  ...props
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const id = useId();

  useImperativeHandle(ref, () => {
    return {
      focus: () => {
        inputRef.current?.focus();
      },
      blur: () => {
        inputRef.current?.blur();
      },
      setValue: (value: string) => {
        if (inputRef.current) {
          inputRef.current.value = value;
        }
      },
      value: () => {
        if (inputRef.current) {
          return inputRef.current.value;
        }
        return '';
      },
    };
  });

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [autoFocus]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.key === 'Enter' && typeof onEnterKeyDown === 'function') {
      onEnterKeyDown(event);
    }
  };

  const input = (
    <input
      className="relative appearance-none outline-hidden rounded duration-85 transition-all bg-gray-50 w-full h-[30px] px-12 text-gray-800 border border-gray-400 focus:border-gray-900 placeholder:text-gray-600 disabled:cursor-default disabled:bg-gray-100 disabled:text-gray-700 enabled:focus:border-gray-900 hover:enabled:border-gray-900"
      ref={inputRef}
      disabled={isDisabled}
      onKeyDown={handleKeyDown}
      readOnly={isReadOnly}
      id={id}
      {...props}
    />
  );

  if (label === undefined) {
    return input;
  }

  return (
    <div className="flex flex-col gap-8">
      <label htmlFor={id}>{label}</label>
      {input}
    </div>
  );
}
