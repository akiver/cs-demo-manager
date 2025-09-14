import React from 'react';
import clsx from 'clsx';

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  ref?: React.Ref<HTMLTextAreaElement>;
  resizable?: boolean;
};

export function TextArea({ resizable = true, ref, ...props }: Props) {
  return (
    <textarea
      ref={ref}
      className={clsx(
        'size-full appearance-none rounded border border-gray-400 bg-gray-50 p-8 text-gray-800 outline-hidden transition-all duration-85 placeholder:text-gray-500 focus:border-gray-900 hover:enabled:border-gray-600 hover:enabled:focus:border-gray-900 disabled:cursor-default disabled:bg-gray-200 disabled:text-gray-500',
        resizable ? 'resize-y' : 'resize-none',
      )}
      style={{
        // @ts-expect-error CSS property supported by Chromium only ATM and not yet in TS defs.
        // TODO Can be removed once this line triggers an error when upgrading TS.
        fieldSizing: 'content',
      }}
      {...props}
    />
  );
}
