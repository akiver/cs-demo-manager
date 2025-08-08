import React from 'react';
import { Trans } from '@lingui/react/macro';
import { CsLocation } from './cs-location';
import { usePlaybackSettings } from './use-playback-settings';
import type { PlaybackSettings } from 'csdm/node/settings/settings';

function buildDescription() {
  if (window.csdm.isWindows) {
    return (
      <Trans>
        Path to the <code>cs2.exe</code> file located in the <code>game\bin\win64</code> folder of your CS2
        installation.
      </Trans>
    );
  }

  return (
    <Trans>
      Path to the <code>cs2.sh</code> script located in the <code>game</code> folder of your CS2 installation.
    </Trans>
  );
}

export function Cs2Location() {
  const { cs2ExecutablePath, customCs2LocationEnabled, updateSettings } = usePlaybackSettings();

  return (
    <CsLocation
      title={<Trans>CS2 location</Trans>}
      description={buildDescription()}
      executablePath={cs2ExecutablePath}
      customLocationEnabled={customCs2LocationEnabled}
      expectedExecutableName={window.csdm.isWindows ? 'cs2.exe' : 'cs2.sh'}
      updateSettings={async ({ isEnabled, executablePath }) => {
        const payload: DeepPartial<PlaybackSettings> = {
          ...(isEnabled !== undefined ? { customCs2LocationEnabled: isEnabled } : {}),
          ...(executablePath !== undefined ? { cs2ExecutablePath: executablePath } : {}),
        };
        await updateSettings(payload);
      }}
    />
  );
}
