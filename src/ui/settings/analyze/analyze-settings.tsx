import React from 'react';
import { SettingsView } from 'csdm/ui/settings/settings-view';
import { ToggleAnalyzePositions } from './toggle-analyze-positions';

export function AnalyzeSettings() {
  return (
    <SettingsView>
      <ToggleAnalyzePositions />
    </SettingsView>
  );
}
