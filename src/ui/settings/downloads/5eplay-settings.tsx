import React from 'react';
import { FiveEPlayAccounts } from './5eplay-accounts';
import { AutoDownload5EPlayDemos } from './auto-download-5eplay-demos';
import { AutoDownload5EPlayDemosBackground } from './auto-download-5eplay-demos-background';

export function FiveEPlaySettings() {
  return (
    <div className="mt-12">
      <h2 className="text-subtitle">5EPlay</h2>
      <AutoDownload5EPlayDemos />
      <AutoDownload5EPlayDemosBackground />
      <FiveEPlayAccounts />
    </div>
  );
}
