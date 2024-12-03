import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import type { FileFilter, OpenDialogOptions, OpenDialogReturnValue } from 'electron';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { Button } from 'csdm/ui/components/buttons/button';
import { RevealFolderInExplorerButton } from '../buttons/reveal-folder-in-explorer-button';
import { RevealFileInExplorerButton } from '../buttons/reveal-file-in-explorer-button';

type Props = {
  label: ReactNode;
  placeholder: string;
  path: string;
  dialogTitle: string;
  defaultPath?: string;
  filters?: FileFilter[];
  onFileSelected: (filePath: string) => void;
  type: 'file' | 'folder';
  name?: string;
  isInputDisabled?: boolean;
  isSelectButtonDisabled?: boolean;
  isRevealButtonDisabled?: boolean;
};

export function FileOrDirectoryInput({
  label,
  placeholder,
  path,
  type,
  onFileSelected,
  defaultPath,
  filters,
  dialogTitle,
  name,
  isInputDisabled = false,
  isSelectButtonDisabled = false,
  isRevealButtonDisabled = false,
  ...props
}: Props) {
  const isFile = type === 'file';

  const onChangeClick = async () => {
    const options: OpenDialogOptions = {
      title: dialogTitle,
      defaultPath,
      filters,
      properties: isFile ? ['openFile'] : ['openDirectory'],
    };
    const { canceled, filePaths }: OpenDialogReturnValue = await window.csdm.showOpenDialog(options);
    if (canceled || filePaths.length === 0) {
      return;
    }

    const [filePath] = filePaths;
    onFileSelected(filePath);
  };

  return (
    <div className="flex flex-col gap-y-4">
      <TextInput
        label={label}
        name={name}
        isReadOnly={true}
        placeholder={placeholder}
        isDisabled={isInputDisabled}
        value={path}
        {...props}
      />
      <div className="flex gap-x-8">
        <Button onClick={onChangeClick} isDisabled={isSelectButtonDisabled}>
          <Trans context="Button">Select</Trans>
        </Button>
        {isFile ? (
          <RevealFileInExplorerButton path={path} isDisabled={isRevealButtonDisabled} />
        ) : (
          <RevealFolderInExplorerButton path={path} isDisabled={isRevealButtonDisabled} />
        )}
      </div>
    </div>
  );
}
