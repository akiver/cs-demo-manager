import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { AddSequenceDialog } from 'csdm/ui/match/video/sequences/add-sequence-dialog';
import { useCurrentMatchSequences } from './use-current-match-sequences';

export function AddNewSequenceButton() {
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const sequences = useCurrentMatchSequences();
  const variant = sequences.length > 0 ? ButtonVariant.Default : ButtonVariant.Primary;

  const onClick = () => {
    setIsDialogVisible(true);
  };

  const closeDialog = () => {
    setIsDialogVisible(false);
  };

  return (
    <>
      <Button onClick={onClick} variant={variant}>
        <Trans context="Button">Add new sequence</Trans>
      </Button>
      <AddSequenceDialog isVisible={isDialogVisible} closeDialog={closeDialog} />
    </>
  );
}
