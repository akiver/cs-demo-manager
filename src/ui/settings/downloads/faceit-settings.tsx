import React from 'react';
import { AutoDownloadFaceitDemos } from './auto-download-faceit-demos';
import { FaceitAccounts } from './faceit-accounts';
import { AutoDownloadFaceitDemosBackground } from './auto-download-faceit-demos-background';
import { FaceitDownloadsWarning } from './faceit-downloads-warning';

export function FaceitSettings() {
  return (
    <div className="mt-12">
      <h2 className="text-subtitle">FACEIT</h2>
      <div className="py-12">
        <FaceitDownloadsWarning />
      </div>
      <AutoDownloadFaceitDemos />
      <AutoDownloadFaceitDemosBackground />
      <FaceitAccounts />
    </div>
  );
}
