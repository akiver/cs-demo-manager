import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react';
import React from 'react';
import clsx from 'clsx';

export const ButtonVariant = {
  Default: 'default',
  Primary: 'primary',
  Danger: 'danger',
} as const;

export type ButtonVariant = (typeof ButtonVariant)[keyof typeof ButtonVariant];

export type Props = {
  ref?: React.Ref<HTMLButtonElement>;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  isDisabled?: boolean;
  children: ReactNode;
  variant?: ButtonVariant;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  form?: string;
};

export function Button({
  children,
  ref,
  isDisabled,
  onClick,
  variant = ButtonVariant.Default,
  type = 'button',
  ...props
}: Props) {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (!onClick || event.detail > 1) {
      return;
    }

    onClick(event);
  };

  return (
    <button
      ref={ref}
      className={clsx(
        'relative flex h-[30px] cursor-default items-center rounded border px-12 leading-none whitespace-nowrap transition-all duration-85 aria-disabled:border-transparent aria-disabled:bg-gray-300 aria-disabled:text-gray-600',
        {
          [ButtonVariant.Default]:
            'bg-gray-50 border-gray-400 text-gray-800 active:bg-gray-200 hover:text-gray-900 hover:border-gray-900 focus:border-gray-800 focus-visible:outline-hidden',
          [ButtonVariant.Danger]: 'bg-red-700 border-red-700 text-white active:bg-red-500 hover:bg-red-600',
          [ButtonVariant.Primary]: 'bg-blue-600 border-blue-600 text-white active:bg-blue-800 hover:bg-blue-700',
        }[variant],
      )}
      aria-disabled={isDisabled}
      type={type}
      onClick={isDisabled ? undefined : handleClick}
      {...props}
    >
      {children}
    </button>
  );
}
