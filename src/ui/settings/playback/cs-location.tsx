import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { RevealFileInExplorerButton } from 'csdm/ui/components/buttons/reveal-file-in-explorer-button';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { ResetButton } from 'csdm/ui/components/buttons/reset-button';
import { ChangeButton } from 'csdm/ui/components/buttons/change-button';

async function showSelectExecutableDialog(executableName: string) {
  const { filePaths, canceled } = await window.csdm.showOpenDialog({
    filters: [{ extensions: window.csdm.isWindows ? ['exe'] : ['sh'], name: executableName }],

    properties: ['openFile'],
  });
  if (canceled || filePaths.length === 0) {
    return;
  }

  const executablePath = filePaths[0];
  const filename = window.csdm.getPathBasename(executablePath);
  if (filename !== executableName) {
    return;
  }

  return executablePath;
}

type Props = {
  title: ReactNode;
  description: ReactNode;
  customLocationEnabled: boolean;
  executablePath: string;
  expectedExecutableName: string;
  updateSettings: (values: { isEnabled?: boolean; executablePath?: string }) => Promise<void>;
};

export function CsLocation({
  title,
  description,
  customLocationEnabled,
  executablePath,
  updateSettings,
  expectedExecutableName,
}: Props) {
  const onCheckboxChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const shouldEnableCustomLocation = event.target.checked;
    if (shouldEnableCustomLocation) {
      let newExecutablePath = executablePath;
      if (!executablePath) {
        const executablePath = await showSelectExecutableDialog(expectedExecutableName);
        if (!executablePath) {
          return;
        }
        newExecutablePath = executablePath;
      }

      await updateSettings({
        isEnabled: true,
        executablePath: newExecutablePath,
      });
    } else {
      await updateSettings({
        isEnabled: false,
      });
    }
  };

  const onChangeClick = async () => {
    const executablePath = await showSelectExecutableDialog(expectedExecutableName);
    if (!executablePath) {
      return;
    }

    await updateSettings({
      executablePath,
    });
  };

  const onResetClick = async () => {
    await updateSettings({
      isEnabled: false,
      executablePath: '',
    });
  };

  return (
    <div className="flex flex-col py-8 border-b border-b-gray-300">
      <p className="text-body-strong">{title}</p>
      <div className="flex flex-col mt-4 gap-y-4">
        <Checkbox
          label={<Trans>Enable custom location</Trans>}
          isChecked={customLocationEnabled}
          onChange={onCheckboxChange}
        />
        <p>{description}</p>
        <div className="flex items-center gap-x-8">
          <TextInput value={executablePath} isReadOnly={true} />
          <RevealFileInExplorerButton path={executablePath} isDisabled={!executablePath} />
          <ChangeButton isDisabled={!executablePath} onClick={onChangeClick} />
          <ResetButton isDisabled={!executablePath && !customLocationEnabled} onClick={onResetClick} />
        </div>
      </div>
    </div>
  );
}
