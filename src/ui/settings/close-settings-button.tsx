import React from 'react';
import { TimesCircleIcon } from 'csdm/ui/icons/times-circle';
import { useSettingsOverlay } from './use-settings-overlay';

export function CloseSettingsButton() {
  const { closeSettings } = useSettingsOverlay();

  return (
    <button
      role="button"
      aria-pressed="false"
      className="flex flex-col items-center mb-16 cursor-pointer duration-85 transition-all hover:text-gray-900"
      onClick={closeSettings}
    >
      <TimesCircleIcon height={40} />
    </button>
  );
}
