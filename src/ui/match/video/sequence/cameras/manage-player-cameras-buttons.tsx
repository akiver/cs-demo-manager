import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';
import { useSequenceForm } from '../use-sequence-form';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { GenerateCamerasDialog } from './generate-cameras-dialog';

export function ManageCamerasButtons() {
  const { showDialog } = useDialog();
  const sequenceContext = useSequenceForm();

  return (
    <div className="flex items-center gap-x-8">
      <Button
        onClick={() => {
          showDialog(<GenerateCamerasDialog sequenceContext={sequenceContext} />);
        }}
      >
        <Trans context="Button">Generate</Trans>
      </Button>

      <Button onClick={sequenceContext.clearPlayerCameras}>
        <Trans context="Button">Clear</Trans>
      </Button>
    </div>
  );
}
