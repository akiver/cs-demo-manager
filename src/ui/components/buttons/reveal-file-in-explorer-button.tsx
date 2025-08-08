import React from 'react';
import { Select, Trans } from '@lingui/react/macro';
import type { ButtonVariant } from 'csdm/ui/components/buttons/button';
import { Button } from 'csdm/ui/components/buttons/button';
import { useShowToast } from '../toasts/use-show-toast';

type Props = {
  path: string;
  isDisabled?: boolean;
  onFileRevealed?: () => void;
  onFileNotFound?: () => void;
  variant?: ButtonVariant;
};

export function RevealFileInExplorerButton({ path, isDisabled, onFileRevealed, onFileNotFound, variant }: Props) {
  const showToast = useShowToast();
  const onClick = async () => {
    const fileExists = await window.csdm.pathExists(path);
    if (fileExists) {
      window.csdm.browseToFile(path);
      onFileRevealed?.();
    } else {
      if (typeof onFileNotFound === 'function') {
        onFileNotFound();
      } else {
        showToast({
          content: <Trans>File not found</Trans>,
          type: 'error',
        });
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
