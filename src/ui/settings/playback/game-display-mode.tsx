import React from 'react';
import { Trans } from '@lingui/react/macro';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { usePlaybackSettings } from './use-playback-settings';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';
import { Select, type SelectOption } from 'csdm/ui/components/inputs/select';
import { DisplayMode } from 'csdm/common/types/display-mode';

export function GameDisplayMode() {
  const { displayMode, updateSettings } = usePlaybackSettings();

  const options: SelectOption<DisplayMode>[] = [
    {
      value: DisplayMode.Windowed,
      label: <Trans>Windowed</Trans>,
    },
    {
      value: DisplayMode.FullscreenWindowed,
      label: <Trans>Fullscreen Windowed</Trans>,
    },
  ];

  if (!window.csdm.isLinux) {
    options.push({
      value: DisplayMode.Fullscreen,
      label: <Trans>Fullscreen</Trans>,
    });
  }

  return (
    <SettingsEntry
      interactiveComponent={
        <div>
          <Select
            options={options}
            value={displayMode}
            onChange={async (mode) => {
              await updateSettings({
                displayMode: mode,
              });
            }}
          />
        </div>
      }
      description={
        <div className="flex flex-col">
          <span>
            <Trans>Start the game in fullscreen mode</Trans>
          </span>
          {window.csdm.isLinux && (
            <div className="flex items-center gap-x-4">
              <ExclamationTriangleIcon className="size-12 shrink-0 text-orange-700" />
              <p className="text-caption">
                <Trans>Valve removed the fullscreen option in a September 2025 game update!</Trans>
              </p>
            </div>
          )}
        </div>
      }
      title={<Trans context="Settings title">Display mode</Trans>}
    />
  );
}
