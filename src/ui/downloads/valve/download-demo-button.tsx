import React from 'react';
import { useSelectedMatch } from './use-selected-match';
import { buildDownloadFromValveMatch } from 'csdm/common/download/build-download-from-valve-match';
import { DownloadDemoButton } from 'csdm/ui/downloads/download-demo-button';

export function MatchDownloadDemoButton() {
  const selectedMatch = useSelectedMatch();
  const download = buildDownloadFromValveMatch(selectedMatch);

  return <DownloadDemoButton status={selectedMatch.downloadStatus} download={download} />;
}
