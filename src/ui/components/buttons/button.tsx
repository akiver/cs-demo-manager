import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react';
import React, { forwardRef } from 'react';

export const ButtonVariant = {
  Default: 'default',
  Primary: 'primary',
  Danger: 'danger',
} as const;

export type ButtonVariant = (typeof ButtonVariant)[keyof typeof ButtonVariant];

const variantsClasses: { [variantName in ButtonVariant]: string } = {
  [ButtonVariant.Default]:
    'bg-gray-50 border-gray-400 text-gray800 active:bg-gray-200 hover:text-gray-900 hover:border-gray-900 focus:border-gray-800 focus-visible:outline-none',
  [ButtonVariant.Danger]: 'bg-red-700 border-red-700 text-white active:bg-red-500 hover:bg-red-600',
  [ButtonVariant.Primary]: 'bg-blue-600 border-blue-600 text-white active:bg-blue-800 hover:bg-blue-700',
};

export type Props = {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  isDisabled?: boolean;
  children: ReactNode;
  variant?: ButtonVariant;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
};

export const Button = forwardRef(function Button(
  { children, isDisabled, onClick, variant = ButtonVariant.Default, type = 'button', ...props }: Props,
  ref: React.Ref<HTMLButtonElement>,
) {
  const className = variantsClasses[variant];
  return (
    <button
      ref={ref}
      className={`px-12 leading-none whitespace-nowrap rounded border flex items-center duration-85 transition-all relative cursor-default h-[30px] aria-disabled:bg-gray-300 aria-disabled:text-gray-600 aria-disabled:border-transparent ${className}`}
      aria-disabled={isDisabled}
      type={type}
      onClick={isDisabled ? undefined : onClick}
      {...props}
    >
      {children}
    </button>
  );
});
