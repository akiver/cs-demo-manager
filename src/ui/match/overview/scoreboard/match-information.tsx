import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { useSecondsToFormattedMinutes } from 'csdm/ui/hooks/use-seconds-to-formatted-minutes';
import type { Match } from 'csdm/common/types/match';
import { Tags } from 'csdm/ui/components/tags/tags';
import { getTeamScoreClassName } from 'csdm/ui/styles/get-team-score-class-name';
import { useFormatDate } from 'csdm/ui/hooks/use-format-date';
import { useGetMapThumbnailSrc } from 'csdm/ui/maps/use-get-map-thumbnail-src';
import { MatchCommentInput } from 'csdm/ui/match/match-comment-input';
import { useGetDemoSourceName } from 'csdm/ui/demos/use-demo-sources';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { ChecksumsTagsDialog } from 'csdm/ui/dialogs/checksums-tags-dialog';

type TeamScoresProps = {
  teamNameA: string;
  teamNameB: string;
  scoreTeamA: number;
  scoreTeamB: number;
};

function TeamScores({ teamNameA, teamNameB, scoreTeamA, scoreTeamB }: TeamScoresProps) {
  return (
    <div className="flex items-center">
      <p className={`text-subtitle selectable ${getTeamScoreClassName(scoreTeamA, scoreTeamB)}`}>{scoreTeamA}</p>
      <p className="text-gray-900 ml-4 selectable">{teamNameA}</p>
      <p className="mx-4">
        <Trans context="Versus">vs</Trans>
      </p>
      <p className="text-gray-900 mr-4 selectable">{teamNameB}</p>
      <p className={`text-subtitle selectable ${getTeamScoreClassName(scoreTeamB, scoreTeamA)}`}>{scoreTeamB}</p>
    </div>
  );
}

type FieldProps = {
  name: ReactNode;
  value: string | number;
};

function Field({ name, value }: FieldProps) {
  return (
    <div className="flex items-center">
      <p className="shrink-0">{name}</p>
      <p className="text-gray-900 ml-8 selectable break-all">{value}</p>
    </div>
  );
}

type Props = {
  match: Match;
};

export function MatchInformation({ match }: Props) {
  const secondsToFormattedMinutes = useSecondsToFormattedMinutes();
  const formatDate = useFormatDate();
  const getMapThumbnailSrc = useGetMapThumbnailSrc();
  const getDemoSourceName = useGetDemoSourceName();
  const { showDialog } = useDialog();

  const onEditTagsClick = () => {
    showDialog(<ChecksumsTagsDialog checksums={[match.checksum]} defaultTagIds={match.tagIds} />);
  };

  return (
    <div className="flex">
      <img src={getMapThumbnailSrc(match.mapName, match.game)} alt={match.mapName} className="h-[124px] mr-8" />
      <div className="flex flex-col shrink-0">
        <p className="text-gray-900 selectable">{match.mapName}</p>
        <TeamScores
          teamNameA={match.teamA.name}
          teamNameB={match.teamB.name}
          scoreTeamA={match.teamA.score}
          scoreTeamB={match.teamB.score}
        />
        <p className="selectable">{formatDate(match.date)}</p>
        <p className="selectable">{secondsToFormattedMinutes(match.duration)}</p>
        <Tags tagIds={match.tagIds} onEditClick={onEditTagsClick} />
      </div>
      <div className="flex flex-col w-full ml-16">
        <Field name={<Trans>Source</Trans>} value={getDemoSourceName(match.source)} />
        <Field name={<Trans>Name</Trans>} value={match.name} />
        <Field name={<Trans>Client name</Trans>} value={match.clientName} />
        <Field name={<Trans>Server name</Trans>} value={match.serverName} />
        <div className="flex items-center gap-x-12">
          <Field name={<Trans>Tickrate</Trans>} value={Math.round(match.tickrate)} />
          <Field name={<Trans>Framerate</Trans>} value={Math.round(match.frameRate)} />
        </div>
        <Field name={<Trans>Checksum</Trans>} value={match.checksum} />
      </div>
      <div className="w-full ml-16 max-h-[126px]">
        <MatchCommentInput isResizable={false} />
      </div>
    </div>
  );
}
