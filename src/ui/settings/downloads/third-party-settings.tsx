import React, { type ReactNode } from 'react';
import type { DownloadSettings } from 'csdm/node/settings/settings';
import { AutoDownloadThirdPartyDemos } from './auto-download-third-party-demos';
import { AutoDownloadThirdPartyDemosBackground } from './auto-download-third-party-demos-background';

type Props = {
  name: string;
  logo: ReactNode;
  autoDownloadAtStartupSettingsKey: Extract<keyof DownloadSettings, `download${string}AtStartup`>;
  autoDownloadInBackgroundSettingsKey: Extract<keyof DownloadSettings, `download${string}InBackground`>;
  warning?: ReactNode;
  children?: ReactNode;
};

export function ThirdPartySettings({
  name,
  logo,
  warning,
  autoDownloadAtStartupSettingsKey,
  autoDownloadInBackgroundSettingsKey,
  children,
}: Props) {
  return (
    <div className="mt-12">
      <div className="flex items-center gap-x-8">
        <h2 className="text-subtitle">{name}</h2>
        {logo}
      </div>
      {warning && <div className="py-8">{warning}</div>}
      <AutoDownloadThirdPartyDemos name={name} settingsKey={autoDownloadAtStartupSettingsKey} />
      <AutoDownloadThirdPartyDemosBackground name={name} settingsKey={autoDownloadInBackgroundSettingsKey} />
      {children}
    </div>
  );
}
