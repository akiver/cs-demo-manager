import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Switch } from 'csdm/ui/components/inputs/switch';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { useUpdateSettings } from '../use-update-settings';
import { useUiSettings } from './use-ui-settings';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { ConfirmDialog } from 'csdm/ui/dialogs/confirm-dialog';
import { ButtonVariant } from 'csdm/ui/components/buttons/button';

type Props = {
  enableHardwareAcceleration: boolean;
};

function ConfirmRestartDialog({ enableHardwareAcceleration }: Props) {
  const updateSettings = useUpdateSettings();

  return (
    <ConfirmDialog
      title={<Trans>Hardware Acceleration</Trans>}
      confirmButtonVariant={ButtonVariant.Danger}
      onConfirm={async () => {
        await updateSettings({
          ui: {
            enableHardwareAcceleration,
          },
        });

        window.csdm.restartApp();
      }}
    >
      <Trans>Changing this setting will relaunch the application.</Trans>
    </ConfirmDialog>
  );
}

export function EnableHardwareAcceleration() {
  const { enableHardwareAcceleration } = useUiSettings();
  const { showDialog } = useDialog();

  const onChange = (isChecked: boolean) => {
    showDialog(<ConfirmRestartDialog enableHardwareAcceleration={isChecked} />);
  };

  return (
    <SettingsEntry
      interactiveComponent={<Switch isChecked={enableHardwareAcceleration} onChange={onChange} />}
      description={
        <Trans>Uses your GPU to make the app smoother. Turn this off if you are experiencing visual problems.</Trans>
      }
      title={<Trans context="Settings title">Hardware Acceleration</Trans>}
    />
  );
}
