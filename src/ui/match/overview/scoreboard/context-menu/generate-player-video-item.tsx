import React from 'react';
import { Trans } from '@lingui/react/macro';
import { SubContextMenu } from 'csdm/ui/components/context-menu/sub-context-menu';
import { GeneratePlayerKillsVideoItem } from './generate-player-kills-video-item';
import { GeneratePlayerRoundsVideoItem } from './generate-player-rounds-video-item';
import { GeneratePlayerDeathsVideoItem } from './generate-player-deaths-video-item';

type Props = {
  steamId: string;
};

export function GeneratePlayerVideoItem({ steamId }: Props) {
  return (
    <SubContextMenu label={<Trans context="Context menu">Generate video</Trans>}>
      <GeneratePlayerKillsVideoItem steamId={steamId} />
      <GeneratePlayerDeathsVideoItem steamId={steamId} />
      <GeneratePlayerRoundsVideoItem steamId={steamId} />
    </SubContextMenu>
  );
}
