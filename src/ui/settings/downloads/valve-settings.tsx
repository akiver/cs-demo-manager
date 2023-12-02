import React from 'react';
import { AutoDownloadValveDemos } from './auto-download-valve-demos';
import { AutoDownloadValveDemosBackground } from './auto-download-valve-demos-background';

export function ValveSettings() {
  return (
    <div className="mt-12">
      <h2 className="text-subtitle">Valve</h2>
      <AutoDownloadValveDemos />
      <AutoDownloadValveDemosBackground />
    </div>
  );
}
