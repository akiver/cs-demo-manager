import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { Demo } from 'csdm/common/types/demo';
import { RevealFileInExplorerItem } from 'csdm/ui/components/context-menu/items/reveal-file-in-explorer-item';
import { useIsDemoAnalysisInProgress } from 'csdm/ui/analyses/use-is-demo-analysis-in-progress';
import { useIsDemoInDatabase } from 'csdm/ui/demo/use-is-demo-in-database';
import { TagsItem } from 'csdm/ui/components/context-menu/items/tags-item';
import { ContextMenu } from 'csdm/ui/components/context-menu/context-menu';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { DeleteItem } from 'csdm/ui/components/context-menu/items/delete-item';
import { CommentItem } from 'csdm/ui/components/context-menu/items/comment-item';
import { NavigateToDemoItem } from 'csdm/ui/components/context-menu/items/navigate-to-demo-item';
import { CopyChecksumsItem } from 'csdm/ui/components/context-menu/items/copy-checksums-item';
import { ChangeSourceItem } from 'csdm/ui/components/context-menu/items/change-source-item';
import { useNavigateToMatch } from 'csdm/ui/hooks/use-navigate-to-match';
import { AnalyzeItem } from 'csdm/ui/components/context-menu/items/analyze-item';
import { CopyShareCodeItem } from 'csdm/ui/components/context-menu/items/copy-sharecode-item';
import { Separator } from 'csdm/ui/components/context-menu/separator';
import { RenameItem } from 'csdm/ui/components/context-menu/items/rename-item';
import { CopyFilepathItem } from 'csdm/ui/components/context-menu/items/copy-filepath-item';
import { DemosTagsDialog } from './tags-dialog';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { DeleteDemosDialog } from 'csdm/ui/components/dialogs/delete-demos-dialog';
import { DemoNotFoundDialog } from 'csdm/ui/components/dialogs/demo-not-found-dialog';
import { RenameDemoDialog } from './rename-demo-dialog';
import { ChangeDemosSourceDialog } from 'csdm/ui/components/dialogs/change-demos-source-dialog';
import { UpdateDemosTypeItem } from './update-demos-type-item';
import { CopyItem } from 'csdm/ui/components/context-menu/items/copy-item';
import { DeleteDemosFromDatabaseItem } from './delete-demos-from-database-item';
import { DeleteDemosFromDatabaseDialog } from 'csdm/ui/components/dialogs/delete-demos-from-database-dialog';
import { ExportDemosItem } from './export-demos-items';

type NavigateToMatchItemProps = {
  demos: Demo[];
};

function NavigateToMatchItem({ demos }: NavigateToMatchItemProps) {
  const navigateToMatch = useNavigateToMatch();
  const isDemoAnalysisInProgress = useIsDemoAnalysisInProgress();
  const isDemoInDatabase = useIsDemoInDatabase();

  const isSeeMatchItemDisabled = () => {
    if (demos.length !== 1) {
      return true;
    }

    const [selectedDemo] = demos;

    return !isDemoInDatabase(selectedDemo.checksum) || isDemoAnalysisInProgress(selectedDemo.checksum);
  };

  const onClick = () => {
    navigateToMatch(demos[0].checksum);
  };

  return (
    <ContextMenuItem onClick={onClick} isDisabled={isSeeMatchItemDisabled()}>
      <Trans context="Context menu">See match</Trans>
    </ContextMenuItem>
  );
}

type Props = {
  demos: Demo[];
  onCommentClick: () => void;
  siblingDemoPaths: string[];
};

export function DemoContextMenu({ onCommentClick, demos, siblingDemoPaths }: Props) {
  const { showDialog } = useDialog();
  if (demos.length === 0) {
    return null;
  }

  const checksums = demos.map((demo) => demo.checksum);
  const filepaths = demos.map((demo) => demo.filePath);
  const selectedDemo = demos[demos.length - 1];

  const onTagsClick = () => {
    showDialog(<DemosTagsDialog demos={demos} />);
  };

  const onRenameClick = () => {
    showDialog(<RenameDemoDialog demos={demos} />);
  };

  const onDeleteClick = () => {
    showDialog(<DeleteDemosDialog demos={demos} />);
  };

  const onDeleteFromDatabaseClick = () => {
    showDialog(<DeleteDemosFromDatabaseDialog checksums={checksums} />);
  };

  const onChangeSourceClick = () => {
    const initialSource = demos.length === 1 ? demos[0].source : undefined;
    showDialog(<ChangeDemosSourceDialog checksums={checksums} initialSource={initialSource} />);
  };

  const onDemoNotFound = (demoPath: string) => {
    showDialog(<DemoNotFoundDialog demoPath={demoPath} />);
  };

  return (
    <ContextMenu>
      <NavigateToDemoItem demoPath={selectedDemo.filePath} siblingDemoPaths={siblingDemoPaths} />
      <NavigateToMatchItem demos={demos} />
      <AnalyzeItem demos={demos} />
      <Separator />
      <CommentItem onClick={onCommentClick} isDisabled={demos.length !== 1} />
      <TagsItem onClick={onTagsClick} />
      <RenameItem onClick={onRenameClick} />
      <ChangeSourceItem onClick={onChangeSourceClick} />
      <UpdateDemosTypeItem checksums={checksums} />
      <Separator />
      <ExportDemosItem filepaths={filepaths} />
      <Separator />
      <CopyItem>
        <CopyShareCodeItem shareCodes={demos.map((demo) => demo.shareCode)} />
        <CopyChecksumsItem checksums={checksums} />
        <CopyFilepathItem filepaths={filepaths} />
      </CopyItem>
      <Separator />
      <RevealFileInExplorerItem filePath={selectedDemo.filePath} onFileNotFound={onDemoNotFound} />
      <Separator />
      <DeleteItem onClick={onDeleteClick} />
      <DeleteDemosFromDatabaseItem onClick={onDeleteFromDatabaseClick} />
    </ContextMenu>
  );
}
