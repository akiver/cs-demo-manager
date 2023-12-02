import React from 'react';
import { useNavigateToDemo } from 'csdm/ui/hooks/use-navigate-to-demo';
import { useDownloadFolderPathOrThrowError } from 'csdm/ui/settings/downloads/use-download-folder-path-or-throw-error';
import { DownloadStatus } from 'csdm/common/types/download-status';
import { SeeDemoButton as CommonSeeDemoButton } from 'csdm/ui/components/buttons/see-demo-button';
import { DownloadRequiredTooltip } from './dowload-required-tooltip';

type Props = {
  demoFileName: string;
  downloadStatus: DownloadStatus;
};

export function SeeDemoButton({ demoFileName, downloadStatus }: Props) {
  const downloadFolderPath = useDownloadFolderPathOrThrowError();
  const navigateToDemo = useNavigateToDemo();
  const isDisabled = downloadStatus !== undefined && downloadStatus !== DownloadStatus.Downloaded;

  const onClick = () => {
    const demoPath = `${downloadFolderPath}/${demoFileName}.dem`;
    navigateToDemo(demoPath);
  };

  if (isDisabled) {
    return (
      <DownloadRequiredTooltip>
        <CommonSeeDemoButton onClick={onClick} isDisabled={isDisabled} />
      </DownloadRequiredTooltip>
    );
  }

  return <CommonSeeDemoButton onClick={onClick} isDisabled={isDisabled} />;
}
