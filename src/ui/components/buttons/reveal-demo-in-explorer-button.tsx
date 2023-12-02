import React from 'react';
import { RevealFileInExplorerButton } from 'csdm/ui/components/buttons/reveal-file-in-explorer-button';
import { DemoNotFoundDialog } from 'csdm/ui/components/dialogs/demo-not-found-dialog';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';

type Props = {
  demoPath: string;
  isDisabled?: boolean;
};

export function RevealDemoInExplorerButton({ demoPath, isDisabled }: Props) {
  const { showDialog } = useDialog();

  const onFileNotFound = () => {
    showDialog(<DemoNotFoundDialog demoPath={demoPath} />);
  };

  return <RevealFileInExplorerButton isDisabled={isDisabled} path={demoPath} onFileNotFound={onFileNotFound} />;
}
