import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';

type Props = {
  getElement: () => HTMLElement | null;
  fileName: string;
};

export function ExportHtmlElementAsImageButton({ getElement, fileName }: Props) {
  const showToast = useShowToast();
  const { t } = useLingui();

  const onClick = async () => {
    const element = getElement();
    if (!element) {
      return;
    }

    try {
      const filePath = await window.csdm.elementToImage({
        element,
        fileName,
        title: t({
          context: 'OS save dialog title',
          message: 'Export as PNG',
        }),
      });
      if (filePath) {
        window.csdm.browseToFile(filePath);
      }
    } catch (error) {
      logger.error(error);
      showToast({
        content: t`An error occurred`,
        type: 'error',
      });
    }
  };

  return (
    <Button onClick={onClick} variant={ButtonVariant.Primary}>
      <Trans context="Button">Export as PNG</Trans>
    </Button>
  );
}
