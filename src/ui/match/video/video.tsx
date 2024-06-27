import React from 'react';
import { AddNewSequenceButton } from 'csdm/ui/match/video/sequences/add-new-sequence-button';
import { MatchCommentInput } from 'csdm/ui/match/match-comment-input';
import { Content } from 'csdm/ui/components/content';
import { SequencesTimeline } from './sequences/sequences-timelines/sequences-timeline';
import { AddVideoToQueueButton } from './add-video-to-queue-button';
import { Hlae } from './hlae/hlae';
import { VirtualDub } from './virtualdub/virtual-dub';
import { WidthResolutionInput } from './width-resolution-input';
import { HeightResolutionInput } from './height-resolution-input';
import { CloseGameAfterRecordingCheckbox } from './close-game-after-recording-checkbox';
import { OutputFolderPath } from './output-folder-path';
import { EncoderSoftwareSelect } from './encoder-software-select';
import { Ffmpeg } from './ffmpeg/ffmpeg';
import { FramerateInput } from './framerate-input';
import { ConcatenateSequencesCheckbox } from './concatenate-sequences-checkbox';
import { GenerateOnlyRawFilesCheckbox } from './generate-only-raw-files-checkbox';
import { DeleteRawFilesAfterEncodingCheckbox } from './delete-raw-files-after-encoding-checkbox';
import { GeneratePlayerSequencesButton } from './generate-player-sequences-button';
import { DeleteSequencesButton } from './sequences/delete-sequences-button';
import { ShowOnlyDeathNoticesCheckbox } from './show-only-death-notices-checkbox';
import { RawFilesFolderPath } from './raw-files-folder-path';
import { ResetSettingsButton } from './reset-settings-button';
import { SequencesSummary } from './sequences-summary';

export function MatchVideo() {
  return (
    <Content>
      <div className="flex flex-col">
        <div className="flex items-center gap-x-8">
          <AddVideoToQueueButton />
          <AddNewSequenceButton />
          <GeneratePlayerSequencesButton />
          <ResetSettingsButton />
          <DeleteSequencesButton />
          <SequencesSummary />
        </div>
        <div className="flex gap-x-12 mt-12">
          <div className="flex gap-x-12 border p-8 rounded">
            <div className="flex flex-col">
              <EncoderSoftwareSelect />
              <GenerateOnlyRawFilesCheckbox />
              <CloseGameAfterRecordingCheckbox />
              <ConcatenateSequencesCheckbox />
              <DeleteRawFilesAfterEncodingCheckbox />
              <ShowOnlyDeathNoticesCheckbox />
              <div className="flex mt-8 gap-x-8">
                <WidthResolutionInput />
                <HeightResolutionInput />
                <FramerateInput />
              </div>
            </div>
            <div className="flex flex-col gap-y-8">
              <RawFilesFolderPath />
              <OutputFolderPath />
            </div>
          </div>
          {window.csdm.isWindows && <Hlae />}
          <Ffmpeg />
          <VirtualDub />
          <div className="w-[324px]">
            <MatchCommentInput />
          </div>
        </div>
        <div className="mt-12">
          <SequencesTimeline />
        </div>
      </div>
    </Content>
  );
}
