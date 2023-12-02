import React, { useEffect, useState } from 'react';
import { Trans } from '@lingui/macro';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { Select, type SelectOption } from 'csdm/ui/components/inputs/select';
import { StartupBehavior } from 'csdm/common/types/startup-behavior';

export function SystemStartupBehavior() {
  // Because the login items API on macOS Ventura changed, the Electron option "openAsHidden" doesn't work anymore.
  // It means that the we can't start the app minimized on startup.
  // Electron doesn't support the new API yet but it will in a future update.
  // See the PR https://github.com/electron/electron/pull/37244
  // TODO deps Make the minimized behavior working on macOS 13+ (Darwin version 22) when Electron supports it
  let isAtLeastMacOs13 = false;
  if (window.csdm.isMac) {
    const osVersion = window.csdm.getAppInformation().osVersion;
    const majorVersionString = osVersion.split('.')[0];
    const majorVersion = parseInt(majorVersionString, 10);
    isAtLeastMacOs13 = majorVersion >= 22;
  }

  const [behavior, setBehavior] = useState<StartupBehavior>(
    isAtLeastMacOs13 ? StartupBehavior.On : StartupBehavior.Minimized,
  );

  useEffect(() => {
    (async () => {
      setBehavior(await window.csdm.getSystemStartupBehavior());
    })();
  }, []);

  const onChange = async (behavior: StartupBehavior) => {
    await window.csdm.updateSystemStartupBehavior(behavior);
    setBehavior(behavior);
  };

  const options: SelectOption<StartupBehavior>[] = isAtLeastMacOs13
    ? []
    : [
        {
          value: StartupBehavior.Minimized,
          label: <Trans>Minimized</Trans>,
        },
      ];

  options.push(
    ...[
      {
        value: StartupBehavior.Off,
        label: <Trans>No</Trans>,
      },
      {
        value: StartupBehavior.On,
        label: <Trans>Yes</Trans>,
      },
    ],
  );

  return (
    <SettingsEntry
      interactiveComponent={<Select<StartupBehavior> options={options} onChange={onChange} value={behavior} />}
      description={<Trans>Open the application automatically after you log in to your computer</Trans>}
      title={<Trans context="Settings title">System startup behavior</Trans>}
    />
  );
}
