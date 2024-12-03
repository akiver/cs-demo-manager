import React from 'react';
import { Select, Trans } from '@lingui/react/macro';
import type { ButtonVariant } from 'csdm/ui/components/buttons/button';
import { Button } from 'csdm/ui/components/buttons/button';
import { usePathExists } from 'csdm/ui/hooks/use-path-exists';
import { useShowToast } from '../toasts/use-show-toast';

type Props = {
  path: string;
  isDisabled?: boolean;
  variant?: ButtonVariant;
  onFolderRevealed?: () => void;
};

export function RevealFolderInExplorerButton({ path, isDisabled, variant, onFolderRevealed }: Props) {
  const showToast = useShowToast();
  const folderExists = usePathExists(path);

  const onClick = () => {
    if (folderExists) {
      window.csdm.browseToFolder(path);
      onFolderRevealed?.();
    } else {
      showToast({
        content: <Trans>Folder not found</Trans>,
        id: 'folder-not-found',
        type: 'error',
      });
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
