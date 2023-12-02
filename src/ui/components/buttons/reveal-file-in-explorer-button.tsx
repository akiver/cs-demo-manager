import React from 'react';
import { Select } from '@lingui/macro';
import type { ButtonVariant } from 'csdm/ui/components/buttons/button';
import { Button } from 'csdm/ui/components/buttons/button';

type Props = {
  path: string;
  isDisabled?: boolean;
  onFileRevealed?: () => void;
  onFileNotFound?: () => void;
  variant?: ButtonVariant;
};

export function RevealFileInExplorerButton({ path, isDisabled, onFileRevealed, onFileNotFound, variant }: Props) {
  const onClick = async () => {
    const fileExists = await window.csdm.pathExists(path);
    if (fileExists) {
      window.csdm.browseToFile(path);
      onFileRevealed?.();
    } else {
      if (typeof onFileNotFound === 'function') {
        onFileNotFound();
      }
    }
  };

  return (
    <Button onClick={onClick} isDisabled={isDisabled} variant={variant}>
      <Select
        value={window.csdm.platform}
        _darwin="Reveal in Finder"
        _win32="Reveal in Explorer"
        other="Reveal in files explorer"
      />
    </Button>
  );
}
