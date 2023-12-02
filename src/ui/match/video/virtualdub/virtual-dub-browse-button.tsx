import React from 'react';
import { useIsVirtualDubInstalled } from 'csdm/ui/match/video/virtualdub/use-is-virtual-dub-installed';
import { SoftwareBrowseButton } from 'csdm/ui/match/video/software-browse-button';

export function VirtualDubBrowseButton() {
  const isVirtualDubInstalled = useIsVirtualDubInstalled();

  return (
    <SoftwareBrowseButton
      isDisabled={!isVirtualDubInstalled}
      getApplicationFolderPath={window.csdm.getVirtualDubExecutablePath}
    />
  );
}
