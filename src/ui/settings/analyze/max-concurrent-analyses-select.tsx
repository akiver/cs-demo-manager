import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { useUpdateSettings } from '../use-update-settings';
import { useAnalyzeSettings } from './use-analyze-settings';
import { MAX_CONCURRENT_ANALYSES } from 'csdm/common/analyses';

export function MaxConcurrentAnalysesSelect() {
  const { maxConcurrentAnalyses } = useAnalyzeSettings();
  const updateSettings = useUpdateSettings();

  const options: SelectOption<number>[] = Array.from({ length: MAX_CONCURRENT_ANALYSES }, (n, i) => ({
    value: i + 1,
    label: i + 1,
  }));

  return (
    <SettingsEntry
      interactiveComponent={
        <Select
          options={options}
          value={maxConcurrentAnalyses}
          onChange={async (maxConcurrentAnalyses) => {
            await updateSettings({
              analyze: {
                maxConcurrentAnalyses: Number(maxConcurrentAnalyses),
              },
            });
          }}
        />
      }
      title={<Trans context="Settings title">Maximum number of concurrent analyses</Trans>}
      description={<Trans>Maximum number of analyses that can run at the same time.</Trans>}
    />
  );
}
