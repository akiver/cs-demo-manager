import { i18n } from '@lingui/core';
import { onDownloadThirdPartyServiceDemosStarted } from './on-download-third-party-service-demos-started';

export function onDownloadValveDemoStarted() {
  return onDownloadThirdPartyServiceDemosStarted({
    title: i18n.t({
      id: 'notification.downloadingValveDemo.title',
      message: 'Downloading Valve demos',
    }),
    message: i18n.t({
      id: 'notification.downloadingValveDemo.message',
      message: 'New Valve demos are being downloaded, click here to show them',
    }),
  });
}
