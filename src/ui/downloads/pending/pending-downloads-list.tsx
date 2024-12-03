import React from 'react';
import { Trans } from '@lingui/react/macro';
import { DownloadEntry } from 'csdm/ui/downloads/pending/download-entry';
import { useDownloads } from './use-downloads';
import { Message } from 'csdm/ui/components/message';

export function PendingDownloadsList() {
  const downloads = useDownloads();

  if (downloads.length === 0) {
    return <Message message={<Trans>No pending downloads.</Trans>} />;
  }

  return (
    <div className="flex flex-col gap-y-8 p-16 overflow-y-auto">
      {downloads.map((download) => (
        <DownloadEntry key={download.matchId} download={download} />
      ))}
    </div>
  );
}
