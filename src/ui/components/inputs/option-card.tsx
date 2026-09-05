import React, { type ReactNode } from 'react';
import { Radio as BaseRadio } from '@base-ui/react/radio';

type OptionCardProps = {
  value: string;
  title: ReactNode;
  description: ReactNode;
};

export function OptionCard({ value, title, description }: OptionCardProps) {
  return (
    <BaseRadio.Root
      value={value}
      className="flex flex-1 cursor-pointer flex-col gap-y-4 rounded-4 border border-gray-400 bg-gray-50 p-12 text-left outline-hidden transition-colors duration-100 not-data-checked:hover:border-gray-900 focus-visible:border-gray-900 data-checked:border-blue-600 data-checked:bg-gray-75 data-disabled:opacity-50"
    >
      <div className="flex items-center gap-x-8">
        <span className="flex size-16 items-center justify-center rounded-full border border-gray-700 in-data-checked:border-blue-600 in-data-checked:bg-blue-600">
          <BaseRadio.Indicator className="size-8 rounded-full bg-gray-50 data-unchecked:hidden" />
        </span>
        <p className="text-body-strong">{title}</p>
      </div>
      <div className="text-gray-800">{description}</div>
    </BaseRadio.Root>
  );
}
