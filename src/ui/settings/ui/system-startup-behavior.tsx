import React, { useEffect, useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { Select, type SelectOption } from 'csdm/ui/components/inputs/select';
import { StartupBehavior } from 'csdm/common/types/startup-behavior';

export function SystemStartupBehavior() {
  const [behavior, setBehavior] = useState<StartupBehavior>(StartupBehavior.Minimized);

  useEffect(() => {
    void (async () => {
      setBehavior(await window.csdm.getSystemStartupBehavior());
    })();
  }, []);

  const onChange = async (behavior: StartupBehavior) => {
    await window.csdm.updateSystemStartupBehavior(behavior);
    setBehavior(behavior);
  };

  const options: SelectOption<StartupBehavior>[] = [
    {
      value: StartupBehavior.Minimized,
      label: <Trans>Minimized</Trans>,
    },
    {
      value: StartupBehavior.Off,
      label: <Trans>No</Trans>,
    },
    {
      value: StartupBehavior.On,
      label: <Trans>Yes</Trans>,
    },
  ];

  return (
    <SettingsEntry
      interactiveComponent={<Select<StartupBehavior> options={options} onChange={onChange} value={behavior} />}
      description={<Trans>Open the application automatically after you log in to your computer</Trans>}
      title={<Trans context="Settings title">System startup behavior</Trans>}
    />
  );
}
