import React from 'react';
import { useDownloadFolderPathOrThrowError } from 'csdm/ui/settings/downloads/use-download-folder-path-or-throw-error';
import { DownloadStatus } from 'csdm/common/types/download-status';
import { RevealDemoInExplorerButton as RevealDemoInExplorerCommonButton } from 'csdm/ui/components/buttons/reveal-demo-in-explorer-button';
import { DownloadRequiredTooltip } from './dowload-required-tooltip';

type Props = {
  downloadStatus: DownloadStatus;
  demoFileName: string;
};

export function RevealDemoInExplorerButton({ downloadStatus, demoFileName }: Props) {
  const downloadFolderPath = useDownloadFolderPathOrThrowError();
  const demoPath = `${downloadFolderPath}/${demoFileName}.dem`;
  const isDisabled = downloadStatus !== DownloadStatus.Downloaded;

  if (isDisabled) {
    return (
      <DownloadRequiredTooltip>
        <RevealDemoInExplorerCommonButton demoPath={demoPath} isDisabled={isDisabled} />
      </DownloadRequiredTooltip>
    );
  }

  return <RevealDemoInExplorerCommonButton demoPath={demoPath} isDisabled={isDisabled} />;
}
