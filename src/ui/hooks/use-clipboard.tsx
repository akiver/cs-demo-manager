import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';

export function useClipboard() {
  const showToast = useShowToast();

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
    showToast({
      content: <Trans context="Toast">Copied to clipboard</Trans>,
      id: 'copied-to-clipboard',
      type: 'success',
    });
  };

  return {
    copyToClipboard,
  };
}
