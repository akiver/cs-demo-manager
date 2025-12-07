import { i18n } from '@lingui/core';
import { onDownloadThirdPartyServiceDemosStarted } from './on-download-third-party-service-demos-started';

export function onDownloadRenownDemosStarted() {
  return onDownloadThirdPartyServiceDemosStarted({
    title: i18n.t({
      id: 'notification.downloadingRenownDemo.title',
      message: 'Downloading Renown demos',
    }),
    message: i18n.t({
      id: 'notification.downloadingRenownDemo.message',
      message: 'New Renown demos are being downloaded, click here to show them',
    }),
  });
}
