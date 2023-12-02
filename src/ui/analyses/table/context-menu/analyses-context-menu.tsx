import React from 'react';
import { useSelectedAnalysis } from 'csdm/ui/analyses/use-selected-analysis-demo-id';
import { ContextMenu } from 'csdm/ui/components/context-menu/context-menu';
import { RevealFileInExplorerItem } from 'csdm/ui/components/context-menu/items/reveal-file-in-explorer-item';
import { Separator } from 'csdm/ui/components/context-menu/separator';
import { RemoveDemoFromAnalysesItem } from './remove-demo-from-analyses-item';
import { SeeDemoItem } from './see-demo-item';
import { SeeMatchItem } from './see-match-item';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { DemoNotFoundDialog } from 'csdm/ui/components/dialogs/demo-not-found-dialog';

export function AnalysesContextMenu() {
  const selectedAnalysis = useSelectedAnalysis();
  const { showDialog } = useDialog();

  if (selectedAnalysis === undefined) {
    return null;
  }

  const onDemoNotFound = (demoPath: string) => {
    showDialog(<DemoNotFoundDialog demoPath={demoPath} />);
  };

  return (
    <ContextMenu>
      <SeeMatchItem />
      <SeeDemoItem />
      <RevealFileInExplorerItem filePath={selectedAnalysis.demoPath} onFileNotFound={onDemoNotFound} />
      <Separator />
      <RemoveDemoFromAnalysesItem />
    </ContextMenu>
  );
}
