import React from 'react';
import { Select } from '@lingui/react/macro';
import { ContextMenuItem } from '../context-menu-item';

type Props = {
  filePath: string;
  onFileNotFound: (filePath: string) => void;
};

export function RevealFileInExplorerItem({ filePath, onFileNotFound }: Props) {
  const onClick = async () => {
    const fileExists = await window.csdm.pathExists(filePath);
    if (!fileExists) {
      onFileNotFound(filePath);
      return;
    }

    window.csdm.browseToFile(filePath);
  };

  return (
    <ContextMenuItem onClick={onClick}>
      <Select
        value={window.csdm.platform}
        _darwin="Reveal in Finder"
        _win32="Reveal in Explorer"
        other="Reveal in files explorer"
      />
    </ContextMenuItem>
  );
}
