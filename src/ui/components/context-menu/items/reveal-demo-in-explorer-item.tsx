import React from 'react';
import { RevealFileInExplorerItem } from './reveal-file-in-explorer-item';

type Props = {
  demoPath: string;
  checksum: string;
  onDemoNotFound: (filePath: string, checksum: string) => void;
};

export function RevealDemoInExplorerItem({ checksum, demoPath, onDemoNotFound }: Props) {
  const onFileNotFound = () => {
    onDemoNotFound(demoPath, checksum);
  };

  return <RevealFileInExplorerItem filePath={demoPath} onFileNotFound={onFileNotFound} />;
}
