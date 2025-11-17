import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';
import { useSequenceForm } from '../use-sequence-form';

export function ManageCustomCamerasButtons() {
  const sequenceContext = useSequenceForm();

  return (
    <div className="flex items-center gap-x-8">
      <Button onClick={sequenceContext.clearCustomCameras}>
        <Trans context="Button">Clear</Trans>
      </Button>
    </div>
  );
}
