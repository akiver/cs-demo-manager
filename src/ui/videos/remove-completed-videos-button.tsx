import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { removeCompletedVideos } from 'csdm/ui/videos/videos-actions';

export function RemoveCompletedVideosButton() {
  const dispatch = useDispatch();

  return (
    <Button
      variant={ButtonVariant.Default}
      onClick={() => {
        dispatch(removeCompletedVideos());
      }}
    >
      <Trans context="Button">Remove completed</Trans>
    </Button>
  );
}
