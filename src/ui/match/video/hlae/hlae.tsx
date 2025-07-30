import React from 'react';
import { Trans } from '@lingui/react/macro';
import { HlaeInstallButton } from 'csdm/ui/match/video/hlae/hlae-install-button';
import { HlaeUpdateButton } from 'csdm/ui/match/video/hlae/hlae-update-button';
import { HlaeBrowseButton } from 'csdm/ui/match/video/hlae/hlae-browse-button';
import { Software } from 'csdm/ui/match/video/software';
import { useInstalledHlaeVersion } from 'csdm/ui/match/video/hlae/use-installed-hlae-version';
import { HlaeConfigFolderPath } from './hlae-config-folder-path';
import { HlaeParameters } from './hlae-parameters';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';
import { useIsHlaeEnabled } from './use-is-hlae-enabled';

function isUnsupportedVersion(version: string | undefined): boolean {
  if (!version) {
    return false;
  }

  const numbers = version.split('.').map(Number);
  if (numbers.length < 3) {
    return false;
  }

  const [major, minor] = numbers;

  // 2.185.3 is the last HLAE version before the 29/07/2025 CS2 update.
  return major === 2 && minor <= 185;
}

export function Hlae() {
  const version = useInstalledHlaeVersion();
  const isHlaeEnabled = useIsHlaeEnabled();

  if (!isHlaeEnabled) {
    return null;
  }

  return (
    <div className="flex flex-col gap-12 border border-gray-400 p-8 rounded">
      <Software
        name="HLAE"
        websiteLink="https://github.com/advancedfx/advancedfx/wiki/Half-Life-Advanced-Effects"
        version={version}
      >
        <HlaeInstallButton />
        <HlaeUpdateButton />
        <HlaeBrowseButton />
      </Software>
      {isUnsupportedVersion(version) && (
        <div className="flex items-center gap-x-8 max-w-[300px]">
          <ExclamationTriangleIcon className="size-20 text-red-700 shrink-0" />
          <div>
            <p className="text-body-strong">
              <Trans>This HLAE version doesn't support the last CS2 update, the game will crash!</Trans>
            </p>
            <p className="text-body-strong">
              <Trans>
                If there is a new version available, please update it. Otherwise, use the "Counter-Strike" recording
                system in the meantime.
              </Trans>
            </p>
          </div>
        </div>
      )}
      <HlaeConfigFolderPath />
      <HlaeParameters />
    </div>
  );
}
