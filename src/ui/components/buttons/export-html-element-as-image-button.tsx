import React from 'react';
import { Trans, msg } from '@lingui/macro';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

type Props = {
  getElement: () => HTMLElement | null;
  fileName: string;
};

export function ExportHtmlElementAsImageButton({ getElement, fileName }: Props) {
  const showToast = useShowToast();
  const _ = useI18n();

  const onClick = async () => {
    const element = getElement();
    if (!element) {
      return;
    }

    try {
      const filePath = await window.csdm.elementToImage({
        element,
        fileName,
        title: _(
          msg({
            context: 'OS save dialog title',
            message: 'Export as PNG',
          }),
        ),
      });
      if (filePath) {
        window.csdm.browseToFile(filePath);
      }
    } catch (error) {
      logger.error(error);
      showToast({
        content: _(msg`An error occurred`),
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
