import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';
import { useShowToast } from '../toasts/use-show-toast';

type Props = {
  filePath: string;
  children: ReactNode;
};

export function RevealLogFileButton({ filePath, children }: Props) {
  const showToast = useShowToast();

  const onBrowseClick = async () => {
    if (!(await window.csdm.pathExists(filePath))) {
      return showToast({
        type: 'error',
        content: <Trans>The log file does not exist</Trans>,
      });
    }

    window.csdm.browseToFile(filePath);
  };

  return <Button onClick={onBrowseClick}>{children}</Button>;
}
