import React from 'react';
import { Trans } from '@lingui/react/macro';
import { DemoCommentInput } from './demo-comment-input';
import { Source } from './demo-source';
import type { Demo } from 'csdm/common/types/demo';
import { DemoNameInput } from './demo-name-input';
import { DemoMap } from './demo-map';
import { DemoDuration } from './demo-duration';
import { DemoDate } from './demo-date';
import { DemoTags } from './demo-tags';
import { DemoField } from './demo-field';
import { roundNumber } from 'csdm/common/math/round-number';

type Props = {
  demo: Demo;
};

export function DemoInformation({ demo }: Props) {
  return (
    <div className="flex flex-col mr-12 gap-y-8 min-w-[354px] max-w-[354px]">
      <DemoMap mapName={demo.mapName} game={demo.game} />
      <DemoDate date={demo.date} />
      <DemoDuration duration={demo.duration} />
      <Source source={demo.source} />
      <DemoField label={<Trans>Path:</Trans>} value={demo.filePath} isCopyable={true} />
      {demo.shareCode !== '' && (
        <DemoField label={<Trans>Share code:</Trans>} value={demo.shareCode} isCopyable={true} />
      )}
      <DemoTags checksum={demo.checksum} tagIds={demo.tagIds} />
      <DemoNameInput checksum={demo.checksum} currentName={demo.name} />
      <DemoCommentInput currentComment={demo.comment} checksum={demo.checksum} />
      <DemoField label={<Trans>Server name:</Trans>} value={demo.serverName} />
      <DemoField label={<Trans>Client name:</Trans>} value={demo.clientName} />
      <div className="flex gap-x-16">
        <DemoField label={<Trans>Tickrate:</Trans>} value={demo.tickrate} />
        <DemoField label={<Trans>Framerate:</Trans>} value={roundNumber(demo.frameRate)} />
      </div>
    </div>
  );
}
