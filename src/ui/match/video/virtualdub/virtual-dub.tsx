import React from 'react';
import { VirtualDubInstallButton } from 'csdm/ui/match/video/virtualdub/virtual-dub-install-button';
import { VirtualDubBrowseButton } from 'csdm/ui/match/video/virtualdub/virtual-dub-browse-button';
import { Software } from 'csdm/ui/match/video/software';
import { useIsVirtualDubInstalled } from 'csdm/ui/match/video/virtualdub/use-is-virtual-dub-installed';
import { VIRTUALDUB_VERSION } from 'csdm/node/video/virtual-dub/virtual-dub-version';
import { EncoderSoftware } from 'csdm/common/types/encoder-software';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';

export function VirtualDub() {
  const virtualDubVersion = useIsVirtualDubInstalled() ? VIRTUALDUB_VERSION : undefined;
  const { settings } = useVideoSettings();

  if (settings.encoderSoftware !== EncoderSoftware.VirtualDub) {
    return null;
  }

  if (settings.generateOnlyRawFiles) {
    return null;
  }

  return (
    <div className="border p-8 rounded">
      <Software name="VirtualDub" websiteLink="http://www.virtualdub.org/" version={virtualDubVersion}>
        <VirtualDubInstallButton />
        <VirtualDubBrowseButton />
      </Software>
    </div>
  );
}
