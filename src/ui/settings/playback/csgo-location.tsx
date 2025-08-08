import React from 'react';
import { Trans } from '@lingui/react/macro';
import { CsLocation } from './cs-location';
import { usePlaybackSettings } from './use-playback-settings';
import type { PlaybackSettings } from 'csdm/node/settings/settings';

function buildDescription() {
  if (window.csdm.isWindows) {
    return (
      <Trans>
        Path to the <code>csgo.exe</code> file located in the root folder of your CS:GO installation.
      </Trans>
    );
  }

  return (
    <Trans>
      Path to the <code>csgo.sh</code> script located in the root folder of your CS:GO installation.
    </Trans>
  );
}

export function CsgoLocation() {
  const { csgoExecutablePath, customCsgoLocationEnabled, updateSettings } = usePlaybackSettings();

  return (
    <CsLocation
      title={<Trans>CS:GO location</Trans>}
      description={buildDescription()}
      executablePath={csgoExecutablePath}
      customLocationEnabled={customCsgoLocationEnabled}
      expectedExecutableName={window.csdm.isWindows ? 'csgo.exe' : 'csgo.sh'}
      updateSettings={async ({ isEnabled, executablePath }) => {
        const payload: DeepPartial<PlaybackSettings> = {
          ...(isEnabled !== undefined ? { customCsgoLocationEnabled: isEnabled } : {}),
          ...(executablePath !== undefined ? { csgoExecutablePath: executablePath } : {}),
        };
        await updateSettings(payload);
      }}
    />
  );
}
