import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useSettingsOverlay } from 'csdm/ui/settings/use-settings-overlay';
import { LeftBarTooltip } from './left-bar-tooltip';
import { CogsIcon } from 'csdm/ui/icons/cogs-icon';

export function SettingsButton() {
  const { openSettings } = useSettingsOverlay();

  const onClick = () => {
    openSettings();
  };

  const shortcut = window.csdm.isMac ? '⌘+,' : 'CTRL+,';

  return (
    <LeftBarTooltip content={<Trans>Settings ({shortcut})</Trans>}>
      <button
        className="flex flex-col items-center w-full no-underline text-gray-400 hover:text-gray-900 cursor-pointer duration-85 transition-all py-4 outline-hidden border border-transparent"
        onClick={onClick}
      >
        <div className="flex justify-center w-32">
          <CogsIcon />
        </div>
      </button>
    </LeftBarTooltip>
  );
}
