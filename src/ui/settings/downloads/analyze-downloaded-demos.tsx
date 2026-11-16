import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Switch } from 'csdm/ui/components/inputs/switch';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { useSettings } from '../use-settings';
import { useUpdateSettings } from '../use-update-settings';

export function AnalyzeDownloadedDemos() {
  const { download } = useSettings();
  const updateSettings = useUpdateSettings();

  const onChange = async (isChecked: boolean) => {
    await updateSettings({
      download: {
        analyzeDownloadedDemos: isChecked,
      },
    });
  };

  return (
    <SettingsEntry
      interactiveComponent={<Switch isChecked={download.analyzeDownloadedDemos} onChange={onChange} />}
      description={<Trans>Automatically analyze demos once they have been downloaded.</Trans>}
      title={<Trans context="Settings title">Analyze downloaded demos</Trans>}
    />
  );
}
