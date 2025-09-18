import React from 'react';
import { SettingsView } from 'csdm/ui/settings/settings-view';
import { ToggleAnalyzePositions } from './toggle-analyze-positions';
import { MaxConcurrentAnalysesSelect } from './max-concurrent-analyses-select';

export function AnalyzeSettings() {
  return (
    <SettingsView>
      <MaxConcurrentAnalysesSelect />
      <ToggleAnalyzePositions />
    </SettingsView>
  );
}
