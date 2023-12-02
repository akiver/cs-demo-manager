import React, { useState, type ReactNode } from 'react';
import { Trans } from '@lingui/macro';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { CenteredContent } from 'csdm/ui/components/content';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { updateMatchDemoLocationSuccess } from '../match-actions';
import { ErrorCode } from 'csdm/common/error-code';
import { useUpdateDemoLocation } from 'csdm/ui/hooks/use-update-demo-location';
import { ErrorMessage } from 'csdm/ui/components/error-message';

type Props = {
  checksum: string;
  demoFilePath: string;
  onUpdated?: (demoFilePath: string) => void;
};

export function UpdateDemoLocation({ checksum, demoFilePath, onUpdated }: Props) {
  const [error, setError] = useState<ReactNode | undefined>(undefined);
  const dispatch = useDispatch();
  const updateDemoLocation = useUpdateDemoLocation();

  const onClick = async () => {
    try {
      const newDemoPath = await updateDemoLocation(checksum);
      if (!newDemoPath) {
        return;
      }
      setError(undefined);
      dispatch(
        updateMatchDemoLocationSuccess({
          checksum,
          demoFilePath: newDemoPath,
        }),
      );
      if (typeof onUpdated === 'function') {
        onUpdated(newDemoPath);
      }
    } catch (error) {
      if (error === ErrorCode.ChecksumsMismatch) {
        setError(<Trans>This demo checksum doesn't match the one associated with the match.</Trans>);
      } else {
        setError(<Trans>An error occurred.</Trans>);
      }
    }
  };

  return (
    <CenteredContent>
      <div className="flex flex-col gap-y-8">
        <p>
          <Trans>
            The demo located at <code className="selectable">{demoFilePath}</code> doesn't exists.
          </Trans>
        </p>
        <div className="self-center">
          <Button onClick={onClick} variant={ButtonVariant.Primary}>
            <Trans context="Button">Update demo location</Trans>
          </Button>
        </div>
        {error !== undefined && <ErrorMessage message={error} />}
      </div>
    </CenteredContent>
  );
}
