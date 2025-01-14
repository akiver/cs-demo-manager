import React from 'react';
import { NavigateToMatchesDemoItem } from 'csdm/ui/components/context-menu/items/navigate-to-matches-demo-item';
import { TagsItem } from '../../components/context-menu/items/tags-item';
import { ContextMenu } from 'csdm/ui/components/context-menu/context-menu';
import { NavigateToMatchItem } from 'csdm/ui/components/context-menu/items/navigate-to-match-item';
import { CopyChecksumsItem } from 'csdm/ui/components/context-menu/items/copy-checksums-item';
import { UpdateMatchDemoLocationItem } from 'csdm/ui/components/context-menu/items/update-match-demo-location-item';
import { Separator } from 'csdm/ui/components/context-menu/separator';
import { DeleteItem } from 'csdm/ui/components/context-menu/items/delete-item';
import { CommentItem } from 'csdm/ui/components/context-menu/items/comment-item';
import { RevealDemoInExplorerItem } from 'csdm/ui/components/context-menu/items/reveal-demo-in-explorer-item';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { UpdateDemoLocationDialog } from 'csdm/ui/dialogs/update-demo-location-dialog';
import type { MatchTable } from 'csdm/common/types/match-table';
import { PlayerDeleteMatchesDialog } from './player-delete-matches-dialog';
import { ExportMatchesItem } from 'csdm/ui/components/context-menu/items/export-matches-item';
import { CopyItem } from 'csdm/ui/components/context-menu/items/copy-item';
import { CopyShareCodeItem } from 'csdm/ui/components/context-menu/items/copy-sharecode-item';
import { CopyFilepathItem } from 'csdm/ui/components/context-menu/items/copy-filepath-item';
import { ChangeMatchesTypeItem } from 'csdm/ui/components/context-menu/items/change-matches-type-item';
import { RenameItem } from 'csdm/ui/components/context-menu/items/rename-item';
import { RenameMatchDialog } from 'csdm/ui/matches/dialogs/rename-match-dialog';
import { WatchItem } from 'csdm/ui/components/context-menu/items/watch-item';
import { isCounterStrikeStartable } from 'csdm/ui/hooks/use-counter-strike';
import { MatchesTagsDialog } from 'csdm/ui/matches/dialogs/tags-dialog';
import { ExportPlayersVoiceItem } from 'csdm/ui/components/context-menu/items/export-players-voice-item';

type Props = {
  matchChecksums: string[];
  selectedMatches: MatchTable[];
  onCommentClick: () => void;
};

export function PlayerMatchContextMenu({ selectedMatches, matchChecksums, onCommentClick }: Props) {
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
    showDialog(<PlayerDeleteMatchesDialog checksums={checksums} />);
  };

  const onRenameClick = () => {
    showDialog(<RenameMatchDialog matches={selectedMatches} />);
  };

  const onDemoNotFound = (demoPath: string, checksum: string) => {
    showDialog(<UpdateDemoLocationDialog demoFilePath={demoPath} checksum={checksum} />);
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
      <Separator />
      <ExportMatchesItem matches={selectedMatches} />
      <ExportPlayersVoiceItem demoPaths={filepaths} />
      <Separator />
      <CopyItem>
        <CopyChecksumsItem checksums={checksums} />
        <CopyShareCodeItem shareCodes={shareCodes} />
        <CopyFilepathItem filepaths={filepaths} />
      </CopyItem>
      <Separator />
      <ChangeMatchesTypeItem checksums={checksums} />
      <Separator />
      <NavigateToMatchesDemoItem matches={selectedMatches} />
      <UpdateMatchDemoLocationItem matches={selectedMatches} />
      <Separator />
      <RenameItem onClick={onRenameClick} />
      <DeleteItem onClick={onDeleteClick} />
    </ContextMenu>
  );
}
