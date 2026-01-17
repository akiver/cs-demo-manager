import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Switch } from 'csdm/ui/components/inputs/switch';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { usePlaybackSettings } from './use-playback-settings';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';

export function GameFullscreen() {
  const { fullscreen, updateSettings } = usePlaybackSettings();

  const onChange = async (isChecked: boolean) => {
    await updateSettings({
      fullscreen: isChecked,
    });
  };

  return (
    <SettingsEntry
      interactiveComponent={<Switch isChecked={fullscreen} onChange={onChange} />}
      description={
        <div className="flex flex-col">
          <span>
            <Trans>Start the game in fullscreen mode</Trans>
          </span>
          {window.csdm.isLinux && (
            <div className="flex items-center gap-x-4">
              <ExclamationTriangleIcon className="size-12 shrink-0 text-orange-700" />
              <p className="text-caption">
                <Trans>
                  Valve removed the CS2 fullscreen video option on Linux since a September 2025 game update. It means
                  that enabling this option will have no effect if the CS2 version is newer than that!
                </Trans>
              </p>
            </div>
          )}
        </div>
      }
      title={<Trans context="Settings title">Fullscreen</Trans>}
    />
  );
}
