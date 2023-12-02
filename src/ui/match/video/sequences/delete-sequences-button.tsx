import React from 'react';
import { Trans } from '@lingui/macro';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { useCurrentMatch } from '../../use-current-match';
import { deleteSequences } from './sequences-actions';

export function DeleteSequencesButton() {
  const dispatch = useDispatch();
  const match = useCurrentMatch();

  const onClick = () => {
    dispatch(
      deleteSequences({
        demoFilePath: match.demoFilePath,
      }),
    );
  };

  return (
    <Button onClick={onClick} variant={ButtonVariant.Danger}>
      <Trans context="Button">Delete sequences</Trans>
    </Button>
  );
}
