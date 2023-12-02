import React from 'react';
import { useIsHlaeInstalled } from 'csdm/ui/match/video/hlae/use-is-hlae-installed';
import { SoftwareBrowseButton } from 'csdm/ui/match/video/software-browse-button';

export function HlaeBrowseButton() {
  const isHlaeInstalled = useIsHlaeInstalled();

  return (
    <SoftwareBrowseButton getApplicationFolderPath={window.csdm.getHlaeExecutablePath} isDisabled={!isHlaeInstalled} />
  );
}
