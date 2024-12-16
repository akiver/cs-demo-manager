import React from 'react';
import { Plural, Trans } from '@lingui/react/macro';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { ContextMenu } from 'csdm/ui/components/context-menu/context-menu';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { useContextMenu } from 'csdm/ui/components/context-menu/use-context-menu';
import { scaleStyle } from 'csdm/ui/components/timeline/use-timeline';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import type { Sequence } from 'csdm/common/types/sequence';
import { deleteSequence } from '../sequences-actions';
import { VideoIcon } from 'csdm/ui/icons/video-icon';
import { FocusIcon } from 'csdm/ui/icons/focus-icon';

type ContextMenuProps = {
  sequence: Sequence;
  onEditClick: (sequence: Sequence) => void;
};

function SequenceContextMenu({ sequence, onEditClick }: ContextMenuProps) {
  const dispatch = useDispatch();
  const match = useCurrentMatch();
  const handleEditClick = () => {
    onEditClick(sequence);
  };
  const onDeleteClick = () => {
    dispatch(deleteSequence({ demoFilePath: match.demoFilePath, sequence }));
  };

  return (
    <ContextMenu>
      <ContextMenuItem onClick={handleEditClick}>
        <Trans context="Context menu">Edit</Trans>
      </ContextMenuItem>
      <ContextMenuItem onClick={onDeleteClick}>
        <Trans context="Context menu">Delete</Trans>
      </ContextMenuItem>
    </ContextMenu>
  );
}

type TooltipProps = {
  sequence: Sequence;
  durationInSeconds: number;
  focusPlayerName?: string;
  cameraCount: number;
};

function TooltipContent({ sequence, durationInSeconds, cameraCount, focusPlayerName }: TooltipProps) {
  const { number, startTick, endTick } = sequence;

  return (
    <div>
      <p className="mb-4">
        <Trans>
          Sequence <strong>#{number}</strong>
        </Trans>
      </p>
      <p>
        <Trans>
          Tick <strong>{startTick}</strong> to <strong>{endTick}</strong> (<strong>{durationInSeconds}s</strong>)
        </Trans>
      </p>
      {cameraCount > 0 && (
        <p>
          <Plural value={cameraCount} one="# camera focus point" other="# camera focus points" />
        </p>
      )}
      {focusPlayerName && (
        <p>
          <Trans>
            First camera focus point on <strong>{focusPlayerName}</strong>
          </Trans>
        </p>
      )}
    </div>
  );
}

type Props = {
  sequence: Sequence;
  ticksPerSecond: number;
  onEditClick: (sequence: Sequence) => void;
};

export function SequenceItem({ sequence, ticksPerSecond, onEditClick }: Props) {
  const { showContextMenu } = useContextMenu();
  const onContextMenu = (event: React.MouseEvent) => {
    showContextMenu(event.nativeEvent, <SequenceContextMenu sequence={sequence} onEditClick={onEditClick} />);
  };
  const durationInSeconds = Math.round((sequence.endTick - sequence.startTick) / ticksPerSecond);
  const cameraCount = sequence.cameras.length;
  const [firstCamera] = sequence.cameras;
  const focusPlayerName = firstCamera?.playerName;

  return (
    <Tooltip
      content={
        <TooltipContent
          sequence={sequence}
          durationInSeconds={durationInSeconds}
          cameraCount={cameraCount}
          focusPlayerName={focusPlayerName}
        />
      }
      placement="top"
      renderInPortal={true}
    >
      <div
        className="flex justify-center flex-col size-full border-y border-gray-700 overflow-hidden text-gray-900 bg-gray-75"
        onContextMenu={onContextMenu}
        onDoubleClick={() => onEditClick(sequence)}
      >
        <div className="absolute w-px bg-gray-900 left-0 origin-left h-full" style={scaleStyle} />
        <div className="absolute w-px bg-gray-900 right-0 origin-right h-full" style={scaleStyle} />
        <div className="whitespace-nowrap pl-4 origin-left" style={scaleStyle}>
          <p>{`#${sequence.number}`}</p>
          <p>{`${durationInSeconds}s`}</p>
          <p>{`${sequence.startTick}-${sequence.endTick}`}</p>
          <div>
            {cameraCount > 0 && (
              <div className="inline-flex items-center gap-x-4">
                <VideoIcon className="size-16" />
                <span>{cameraCount}</span>
              </div>
            )}
          </div>
          <div>
            {focusPlayerName && (
              <div className="inline-flex items-center gap-x-4">
                <FocusIcon className="size-16" />
                <span>{focusPlayerName}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Tooltip>
  );
}
