import { i18n } from '@lingui/core';
import { onDownloadThirdPartyServiceDemosStarted } from './on-download-third-party-service-demos-started';

export function onDownloadFaceitDemoStarted() {
  return onDownloadThirdPartyServiceDemosStarted({
    title: i18n.t({
      id: 'notification.downloadingFaceitDemo.title',
      message: 'Downloading FACEIT demos',
    }),
    message: i18n.t({
      id: 'notification.downloadingFaceitDemo.message',
      message: 'New FACEIT demos are being downloaded, click here to show them',
    }),
  });
}
