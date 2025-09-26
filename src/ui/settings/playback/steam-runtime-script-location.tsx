import React from 'react';
import { Trans } from '@lingui/react/macro';
import { usePlaybackSettings } from './use-playback-settings';
import type { PlaybackSettings } from 'csdm/node/settings/settings';
import { ExecutableLocation } from './executable-location';

export function SteamRuntimeScriptLocation() {
  const { cs2SteamRuntimeScriptPath, customCs2SteamRuntimeScriptLocationEnabled, updateSettings } =
    usePlaybackSettings();

  return (
    <ExecutableLocation
      title={<Trans>Steam runtime script location</Trans>}
      description={
        <div>
          <p>
            <Trans>Path to the Steam runtime script used to start CS2. </Trans>
          </p>
          <p>
            <Trans>
              As of September 2025, this script is named <code>_v2-entry-point</code> and uses the Steam runtime 3
              "Sniper".
            </Trans>
          </p>
          <p>
            <Trans>
              It should be located in the folder <code>steamapps/common/SteamLinuxRuntime_sniper</code> inside the
              folder where Steam is installed.
            </Trans>
          </p>
        </div>
      }
      executablePath={cs2SteamRuntimeScriptPath}
      customLocationEnabled={customCs2SteamRuntimeScriptLocationEnabled}
      updateSettings={async ({ isEnabled, executablePath }) => {
        const payload: DeepPartial<PlaybackSettings> = {
          ...(isEnabled !== undefined ? { customCs2SteamRuntimeScriptLocationEnabled: isEnabled } : {}),
          ...(executablePath !== undefined ? { cs2SteamRuntimeScriptPath: executablePath } : {}),
        };
        console.log(payload);
        await updateSettings(payload);
      }}
    />
  );
}
