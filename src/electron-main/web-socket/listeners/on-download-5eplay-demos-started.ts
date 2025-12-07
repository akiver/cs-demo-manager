import { i18n } from '@lingui/core';
import { onDownloadThirdPartyServiceDemosStarted } from './on-download-third-party-service-demos-started';

export function onDownload5EplayDemoStarted() {
  return onDownloadThirdPartyServiceDemosStarted({
    title: i18n.t({
      id: 'notification.downloading5EplayDemo.title',
      message: 'Downloading 5Eplay demos',
    }),
    message: i18n.t({
      id: 'notification.downloading5EplayDemo.message',
      message: 'New 5Eplay demos are being downloaded, click here to show them',
    }),
  });
}
