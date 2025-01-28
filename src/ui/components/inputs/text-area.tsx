import React from 'react';

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  ref?: React.Ref<HTMLTextAreaElement>;
  resizable?: boolean;
};

export function TextArea({ resizable = true, ref, ...props }: Props) {
  return (
    <textarea
      ref={ref}
      className={`appearance-none outline-hidden rounded duration-85 transition-all bg-gray-50 size-full p-8 text-gray-800 border border-gray-400 focus:border-gray-900 placeholder:text-gray-500 disabled:cursor-default disabled:bg-gray-200 disabled:text-gray-500 hover:enabled:focus:border-gray-900 hover:enabled:border-gray-600 ${
        resizable ? 'resize-y' : 'resize-none'
      }`}
      style={{
        // @ts-expect-error CSS property supported by Chromium only ATM and not yet in TS defs.
        // TODO Can be removed once this line triggers an error when upgrading TS.
        fieldSizing: 'content',
      }}
      {...props}
    />
  );
}
