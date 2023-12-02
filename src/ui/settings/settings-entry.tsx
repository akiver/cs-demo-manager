import type { ReactNode } from 'react';
import React from 'react';

type Props = {
  description: string | ReactNode;
  title: string | ReactNode;
  interactiveComponent: ReactNode;
};

export function SettingsEntry({ title, interactiveComponent, description }: Props) {
  return (
    <div className="flex justify-between items-center py-8 border-b border-b-gray-300">
      <div className="pr-16">
        <p className="text-body-strong">{title}</p>
        <div className="mt-4">{description}</div>
      </div>
      <div>{interactiveComponent}</div>
    </div>
  );
}
