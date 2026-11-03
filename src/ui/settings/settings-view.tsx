import React, { useEffect, useRef, ViewTransition } from 'react';
import { type ReactNode } from 'react';
import { SettingsTabs } from 'csdm/ui/settings/settings-tabs';
import { useSettingsOverlay } from './use-settings-overlay';

type Props = {
  children: ReactNode;
};

export function SettingsView({ children }: Props) {
  const content = useRef<HTMLDivElement>(null);
  const { category } = useSettingsOverlay();

  useEffect(() => {
    if (!content.current) {
      return;
    }

    content.current.scrollTop = 0;
    content.current.focus();
  }, [category]);

  return (
    <div className="flex h-full flex-1 overflow-y-auto pt-(--title-bar-height)">
      <SettingsTabs />
      <ViewTransition default="page">
        <div ref={content} className="flex flex-1 flex-col overflow-y-auto bg-gray-50 p-16" tabIndex={-1}>
          <div className="max-w-[900px]">{children}</div>
        </div>
      </ViewTransition>
    </div>
  );
}
