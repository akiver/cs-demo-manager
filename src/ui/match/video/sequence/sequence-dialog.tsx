import ReactDOM from 'react-dom';
import React, { useRef, useEffect } from 'react';
import { MatchTimeline } from './match-timeline/match-timeline';
import { SequencePlayers } from './sequence-players';
import { StartTickInput } from './start-tick-input';
import { EndTickInput } from './end-tick-input';
import { SequenceDuration } from './sequence-duration';
import { SaveSequenceButton } from './save-sequence-button';
import { SequenceCfgInput } from './sequence-cfg-input';
import { ContextMenuProvider } from 'csdm/ui/components/context-menu/context-menu-provider';
import { FullScreenDialog } from 'csdm/ui/dialogs/full-screen-dialog';
import type { SequenceForm } from './sequence-form';
import { SequenceFormProvider } from './sequence-form-provider';
import type { Sequence } from 'csdm/common/types/sequence';
import { SequenceDiskSpace } from './sequence-disk-space';
import { CancelButton } from 'csdm/ui/components/buttons/cancel-button';
import { SequenceXRayCheckbox } from './sequence-x-ray-checkbox';
import { SequencePlayerVoicesCheckbox } from './sequence-player-voices-checkbox';
import { SequenceCamerasTable } from './cameras/sequence-cameras-table';
import { ManageCamerasButtons } from './cameras/manage-cameras-buttons';
import { PlayersColors } from './players-colors';
import { SequenceShowOnlyDeathNoticesCheckbox } from './show-only-death-notices-checkbox';
import { useCanEditVideoPlayersOptions } from 'csdm/ui/match/video/use-can-edit-video-players-options';
import { SequenceDeathNoticesDurationInput } from './sequence-death-notices-duration-input';

type Props = {
  isVisible: boolean;
  closeDialog: () => void;
  onSaveClick: (sequence: SequenceForm) => void;
  initialSequence: Sequence | undefined;
};

export function SequenceDialog({ isVisible, closeDialog, onSaveClick, initialSequence }: Props) {
  const element = useRef<HTMLDivElement>(document.createElement('div'));
  const node = element.current;
  const canEditPlayersOptions = useCanEditVideoPlayersOptions();

  useEffect(() => {
    document.body.appendChild(node);

    return () => {
      document.body.removeChild(node);
    };
  }, [node]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        closeDialog();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeDialog]);

  return ReactDOM.createPortal(
    <FullScreenDialog isVisible={isVisible}>
      {initialSequence !== undefined && (
        <SequenceFormProvider initialSequence={initialSequence}>
          <ContextMenuProvider>
            <div className="flex flex-col h-full bg-gray-50 p-16 overflow-auto">
              <div className="flex gap-x-12 max-h-[420px] mb-12">
                <div className="flex flex-col gap-y-8">
                  <div className="flex flex-col gap-y-8">
                    <StartTickInput />
                    <EndTickInput />
                  </div>
                  <ManageCamerasButtons />
                  <SequencePlayerVoicesCheckbox />
                  <SequenceXRayCheckbox />
                  <SequenceShowOnlyDeathNoticesCheckbox />
                  {window.csdm.isWindows && <SequenceDeathNoticesDurationInput />}
                  <div className="flex items-center gap-x-12">
                    <SequenceDuration />
                    <SequenceDiskSpace />
                  </div>
                  <div className="flex gap-x-8 mt-12">
                    <SaveSequenceButton onClick={onSaveClick} closeDialog={closeDialog} />
                    <CancelButton onClick={closeDialog} />
                  </div>
                </div>
                <SequenceCamerasTable />
                {canEditPlayersOptions && <SequencePlayers />}
                <SequenceCfgInput />
              </div>
              <PlayersColors />
              <MatchTimeline />
            </div>
          </ContextMenuProvider>
        </SequenceFormProvider>
      )}
    </FullScreenDialog>,
    element.current,
  );
}
