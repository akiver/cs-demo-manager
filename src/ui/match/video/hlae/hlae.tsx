import React from 'react';
import { HlaeInstallButton } from 'csdm/ui/match/video/hlae/hlae-install-button';
import { HlaeUpdateButton } from 'csdm/ui/match/video/hlae/hlae-update-button';
import { HlaeBrowseButton } from 'csdm/ui/match/video/hlae/hlae-browse-button';
import { Software } from 'csdm/ui/match/video/software';
import { useInstalledHlaeVersion } from 'csdm/ui/match/video/hlae/use-installed-hlae-version';
import { HlaeConfigFolderPath } from './hlae-config-folder-path';
import { HlaeParameters } from './hlae-parameters';
import { useIsHlaeEnabled } from './use-is-hlae-enabled';

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
      <HlaeConfigFolderPath />
      <HlaeParameters />
    </div>
  );
}
