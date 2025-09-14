import type { ReactNode } from 'react';
import React from 'react';
import { useLingui } from '@lingui/react/macro';
import { RoundEndReasonIcon } from 'csdm/ui/icons/round-end-reason-icon';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { TagIndicator } from 'csdm/ui/components/tags/tag-indicator';
import { useTags } from 'csdm/ui/tags/use-tags';

function Tags({ tagIds }: { tagIds: string[] }) {
  const maxVisibleTagCount = 9;
  const allTags = useTags();
  const tags = allTags
    .filter((tag) => {
      return tagIds.includes(tag.id);
    })
    .slice(0, maxVisibleTagCount);

  return (
    <div className="flex flex-wrap gap-4 px-4">
      {tags.map((tag) => {
        return <TagIndicator key={tag.id} tag={tag} />;
      })}
    </div>
  );
}

function Cell({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-center bg-gray-50">
      <span>{children}</span>
    </div>
  );
}

function TitleCell({ title }: { title: string }) {
  return (
    <Cell>
      <p className="mr-auto max-w-[248px] truncate px-8" title={title}>
        {title}
      </p>
    </Cell>
  );
}

export function RoundsHistory() {
  const { teamA, teamB, rounds } = useCurrentMatch();
  const { t } = useLingui();

  return (
    <div
      className="mb-12 grid max-w-fit flex-none grid-flow-col grid-rows-[30px_repeat(3,35px)] gap-px overflow-x-auto border border-gray-300 bg-gray-300"
      style={{
        gridTemplateColumns: `auto repeat(${rounds.length}, 40px)`,
      }}
    >
      <TitleCell title={t`Round`} />
      <TitleCell title={teamA.name} />
      <TitleCell title={teamB.name} />
      <TitleCell title={t`Tags`} />
      {rounds.map((round) => {
        return (
          <React.Fragment key={`round-${round.number}`}>
            <Cell>{round.number}</Cell>
            <Cell>{round.winnerTeamName === teamA.name && <RoundEndReasonIcon round={round} />}</Cell>
            <Cell>{round.winnerTeamName === teamB.name && <RoundEndReasonIcon round={round} />}</Cell>
            <Cell>
              <Tags tagIds={round.tagIds} />
            </Cell>
          </React.Fragment>
        );
      })}
    </div>
  );
}
