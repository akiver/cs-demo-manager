import React, { useEffect } from 'react';
import { type ReactNode } from 'react';
import { SettingsTabs } from 'csdm/ui/settings/settings-tabs';
import { useFocusTrap } from 'csdm/ui/hooks/use-focus-trap';

type Props = {
  children: ReactNode;
};

export function SettingsView({ children }: Props) {
  const container = useFocusTrap();

  useEffect(() => {
    container.current?.focus();
  }, [container]);

  return (
    <div ref={container} className="flex flex-1 overflow-y-auto h-full pt-[var(--title-bar-height)]" tabIndex={0}>
      <SettingsTabs />
      <div className="flex flex-col flex-1 p-16 overflow-y-auto bg-gray-50">
        <div className="max-w-[896px]">{children}</div>
      </div>
    </div>
  );
}
