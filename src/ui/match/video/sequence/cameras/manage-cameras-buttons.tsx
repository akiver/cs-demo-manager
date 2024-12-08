import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';
import { useSequenceForm } from '../use-sequence-form';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { GenerateCamerasDialog } from './generate-cameras-dialog';

export function ManageCamerasButtons() {
  const { showDialog } = useDialog();
  const sequenceContext = useSequenceForm();
  const { sequence } = sequenceContext;

  return (
    <div className="flex gap-x-8">
      <Button
        onClick={() => {
          showDialog(<GenerateCamerasDialog sequenceContext={sequenceContext} />);
        }}
      >
        <Trans context="Button">Generate cameras</Trans>
      </Button>
      {sequence.cameras.length > 0 && (
        <Button onClick={sequenceContext.clearCameras}>
          <Trans context="Button">Remove cameras</Trans>
        </Button>
      )}
    </div>
  );
}
