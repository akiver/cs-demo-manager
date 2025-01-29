import React from 'react';
import { NavigateToMatchItem } from 'csdm/ui/components/context-menu/items/navigate-to-match-item';
import { CopyChecksumsItem } from 'csdm/ui/components/context-menu/items/copy-checksums-item';
import { NavigateToMatchesDemoItem } from 'csdm/ui/components/context-menu/items/navigate-to-matches-demo-item';
import { UpdateMatchDemoLocationItem } from 'csdm/ui/components/context-menu/items/update-match-demo-location-item';
import { TagsItem } from 'csdm/ui/components/context-menu/items/tags-item';
import { ContextMenu } from 'csdm/ui/components/context-menu/context-menu';
import { Separator } from 'csdm/ui/components/context-menu/separator';
import { DeleteItem } from 'csdm/ui/components/context-menu/items/delete-item';
import { CommentItem } from 'csdm/ui/components/context-menu/items/comment-item';
import { CopyShareCodeItem } from 'csdm/ui/components/context-menu/items/copy-sharecode-item';
import { RevealDemoInExplorerItem } from 'csdm/ui/components/context-menu/items/reveal-demo-in-explorer-item';
import { RenameItem } from 'csdm/ui/components/context-menu/items/rename-item';
import { CopyFilepathItem } from 'csdm/ui/components/context-menu/items/copy-filepath-item';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { MatchesTagsDialog } from 'csdm/ui/matches/dialogs/tags-dialog';
import { RenameMatchDialog } from 'csdm/ui/matches/dialogs/rename-match-dialog';
import { UpdateDemoLocationDialog } from 'csdm/ui/dialogs/update-demo-location-dialog';
import type { MatchTable } from 'csdm/common/types/match-table';
import { DeleteMatchesDialog } from 'csdm/ui/components/dialogs/delete-matches-dialog';
import { ChangeMatchesTypeItem } from 'csdm/ui/components/context-menu/items/change-matches-type-item';
import { CopyItem } from 'csdm/ui/components/context-menu/items/copy-item';
import { ExportMatchesItem } from 'csdm/ui/components/context-menu/items/export-matches-item';
import { WatchItem } from 'csdm/ui/components/context-menu/items/watch-item';
import { isCounterStrikeStartable } from 'csdm/ui/hooks/use-counter-strike';
import { UpdateTeamNamesDialog } from '../dialogs/update-team-names-dialog';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { Trans } from '@lingui/react/macro';

type Props = {
  matchChecksums: string[];
  selectedMatches: MatchTable[];
  onCommentClick: () => void;
};

export function MatchContextMenu({ selectedMatches, matchChecksums, onCommentClick }: Props) {
  const { showDialog } = useDialog();

  if (selectedMatches.length === 0) {
    return null;
  }

  const checksums: string[] = [];
  const shareCodes: string[] = [];
  const filepaths: string[] = [];
  for (const match of selectedMatches) {
    checksums.push(match.checksum);
    shareCodes.push(match.shareCode);
    filepaths.push(match.demoFilePath);
  }
  const selectedMatch = selectedMatches[selectedMatches.length - 1];

  const onTagsClick = () => {
    showDialog(<MatchesTagsDialog matches={selectedMatches} />);
  };

  const onDeleteClick = () => {
    showDialog(<DeleteMatchesDialog checksums={checksums} />);
  };

  const onRenameClick = () => {
    showDialog(<RenameMatchDialog matches={selectedMatches} />);
  };

  const onDemoNotFound = (demoPath: string, checksum: string) => {
    showDialog(<UpdateDemoLocationDialog demoFilePath={demoPath} checksum={checksum} />);
  };

  const onUpdateTeamNameClick = () => {
    showDialog(<UpdateTeamNamesDialog matches={selectedMatches} />);
  };

  return (
    <ContextMenu>
      <NavigateToMatchItem checksum={selectedMatch.checksum} siblingChecksums={matchChecksums} />
      <RevealDemoInExplorerItem
        demoPath={selectedMatch.demoFilePath}
        checksum={selectedMatch.checksum}
        onDemoNotFound={onDemoNotFound}
      />
      {isCounterStrikeStartable(selectedMatch.game) && <WatchItem demoPath={selectedMatch.demoFilePath} />}
      <CommentItem onClick={onCommentClick} isDisabled={selectedMatches.length !== 1} />
      <TagsItem onClick={onTagsClick} />
      <ChangeMatchesTypeItem checksums={checksums} />
      <ContextMenuItem onClick={onUpdateTeamNameClick}>
        <p>
          <Trans context="Context menu">Update team names</Trans>
        </p>
      </ContextMenuItem>
      <Separator />
      <ExportMatchesItem matches={selectedMatches} />
      <Separator />
      <CopyItem>
        <CopyShareCodeItem shareCodes={shareCodes} />
        <CopyChecksumsItem checksums={checksums} />
        <CopyFilepathItem filepaths={filepaths} />
      </CopyItem>
      <Separator />
      <NavigateToMatchesDemoItem matches={selectedMatches} />
      <UpdateMatchDemoLocationItem matches={selectedMatches} />
      <Separator />
      <RenameItem onClick={onRenameClick} />
      <DeleteItem onClick={onDeleteClick} />
    </ContextMenu>
  );
}
