import ReactDOM from 'react-dom';
import React, { useRef, useEffect } from 'react';
import { MatchTimeline } from './match-timeline/match-timeline';
import { SequenceDeathNotices } from './sequence-death-notices';
import { StartTickInput } from './start-tick-input';
import { EndTickInput } from './end-tick-input';
import { SequenceFocusCameraPlayerSelect } from './sequence-focus-camera-player-select';
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

type Props = {
  isVisible: boolean;
  closeDialog: () => void;
  onSaveClick: (sequence: SequenceForm) => void;
  initialSequence: Sequence | undefined;
};

export function SequenceDialog({ isVisible, closeDialog, onSaveClick, initialSequence }: Props) {
  const element = useRef<HTMLDivElement>(document.createElement('div'));
  const node = element.current;

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
              <div className="flex gap-x-12">
                <div className="flex flex-col gap-y-8">
                  <div className="flex gap-x-8">
                    <StartTickInput />
                    <EndTickInput />
                  </div>
                  <SequenceXRayCheckbox />
                  <SequenceFocusCameraPlayerSelect />
                  <div>
                    <SequenceDuration />
                    <SequenceDiskSpace />
                  </div>
                  <div className="flex gap-x-8">
                    <SaveSequenceButton onClick={onSaveClick} closeDialog={closeDialog} />
                    <CancelButton onClick={closeDialog} />
                  </div>
                </div>
                {window.csdm.isWindows && <SequenceDeathNotices />}
                <SequenceCfgInput />
              </div>
              <div className="mt-12">
                <MatchTimeline />
              </div>
            </div>
          </ContextMenuProvider>
        </SequenceFormProvider>
      )}
    </FullScreenDialog>,
    element.current,
  );
}
