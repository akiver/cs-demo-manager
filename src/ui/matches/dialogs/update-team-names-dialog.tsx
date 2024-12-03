import React, { useState, type ReactNode } from 'react';
import { Plural, Trans } from '@lingui/react/macro';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import type { MatchTable } from 'csdm/common/types/match-table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { CancelButton } from 'csdm/ui/components/buttons/cancel-button';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { uniqueArray } from 'csdm/common/array/unique-array';
import { isErrorCode } from 'csdm/common/is-error-code';
import { ErrorCode } from 'csdm/common/error-code';
import { teamNamesUpdated } from '../matches-actions';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { Status } from 'csdm/common/types/status';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import { Spinner } from 'csdm/ui/components/spinner';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';

function getInitialTeamName(matches: MatchTable[], prop: 'teamAName' | 'teamBName') {
  const names = uniqueArray(matches.map((match) => match[prop]));

  return names.length === 1 ? names[0] : '';
}

type Props = {
  matches: MatchTable[];
};

export function UpdateTeamNamesDialog({ matches }: Props) {
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const showToast = useShowToast();
  const { hideDialog } = useDialog();
  const [teamNameA, setTeamNameA] = useState<string>(() => getInitialTeamName(matches, 'teamAName'));
  const [teamNameB, setTeamNameB] = useState<string>(getInitialTeamName(matches, 'teamBName'));
  const [status, setStatus] = useState<Status>(Status.Idle);
  const [error, setError] = useState<ReactNode>('');
  const [updatedCount, setUpdatedCount] = useState(0);
  const isUpdating = status === Status.Loading;

  const onSubmit = async () => {
    if (isUpdating) {
      return;
    }

    try {
      setStatus(Status.Loading);
      client.on(RendererServerMessageName.TeamNamesUpdated, setUpdatedCount);

      const updates = await client.send({
        name: RendererClientMessageName.UpdateMatchesTeamNames,
        payload: {
          checksums: matches.map((match) => match.checksum),
          teamNameA,
          teamNameB,
        },
      });

      const updateCount = Object.keys(updates).length;
      if (updateCount > 0) {
        showToast({
          content: <Plural value={updateCount} one="The match has been updated" other="# matches have been updated" />,
          type: 'success',
        });
        dispatch(teamNamesUpdated(updates));
      }

      hideDialog();
    } catch (error) {
      const errorCode = isErrorCode(error) ? error : ErrorCode.UnknownError;
      let errorMessage: ReactNode;
      switch (errorCode) {
        case ErrorCode.DuplicateTeamName:
          errorMessage = <Trans>The team names must be different.</Trans>;
          break;
        case ErrorCode.TeamsNotFound:
          errorMessage = <Trans>The teams have not been found.</Trans>;
          break;
        default:
          errorMessage = <Trans>An error occurred.</Trans>;
          break;
      }
      setError(errorMessage);
      setStatus(Status.Error);
    } finally {
      client.off(RendererServerMessageName.TeamNamesUpdated, setUpdatedCount);
    }
  };

  const renderMessage = () => {
    if (isUpdating) {
      const matchCount = matches.length;
      return (
        <div className="flex items-center gap-x-8">
          <Spinner size={24} />
          <p>
            <Trans>
              Updating team names of match {updatedCount} out of {matchCount}.
            </Trans>
          </p>
        </div>
      );
    }

    if (status === Status.Error) {
      return <ErrorMessage message={error} />;
    }

    return null;
  };

  const onCancelClick = async () => {
    setStatus(Status.Idle);
    await client.send({
      name: RendererClientMessageName.AbortCurrentTask,
    });
    hideDialog();
  };

  return (
    <Dialog
      onEnterPressed={onSubmit}
      blockNavigation={isUpdating}
      closeOnBackgroundClicked={!isUpdating}
      closeOnEscPressed={!isUpdating}
    >
      <DialogHeader>
        <DialogTitle>
          <Trans context="Dialog title">Update team names</Trans>
        </DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="flex flex-col gap-y-8 max-w-[524px]">
          <TextInput
            value={teamNameA}
            onChange={(event) => {
              setTeamNameA(event.target.value);
            }}
            isDisabled={isUpdating}
            label={<Trans context="Input label">Team A</Trans>}
          />
          <TextInput
            value={teamNameB}
            onChange={(event) => {
              setTeamNameB(event.target.value);
            }}
            isDisabled={isUpdating}
            label={<Trans context="Input label">Team B</Trans>}
          />

          <div className="flex items-center gap-x-8 mt-8">
            <ExclamationTriangleIcon className="size-24 text-red-700" />
            <div>
              <p>
                <Trans>You should rename team names only to merge stats into a single team!</Trans>
              </p>
              <p>
                <Trans>The only way to restore team names is by re-analyzing demos!</Trans>
              </p>
            </div>
          </div>
          {renderMessage()}
        </div>
      </DialogContent>
      <DialogFooter>
        <Button onClick={onSubmit} variant={ButtonVariant.Primary}>
          <Trans context="Button">Update</Trans>
        </Button>
        <CancelButton onClick={onCancelClick} />
      </DialogFooter>
    </Dialog>
  );
}
