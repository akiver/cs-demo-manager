import React from 'react';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { NoAnalysis } from '../no-analysis';
import type { Analysis } from 'csdm/common/types/analysis';
import { useAnalyses } from '../use-analyses';
import { AnalysesActionBar } from '../action-bar/action-bar';
import { analysisSelected } from 'csdm/ui/analyses/analyses-actions';
import { useSelectedAnalysis } from '../use-selected-analysis-demo-id';
import { useContextMenu } from 'csdm/ui/components/context-menu/use-context-menu';
import { AnalysesContextMenu } from './context-menu/analyses-context-menu';
import { useAnalysesColumns } from './use-analyses-columns';
import { useTable } from 'csdm/ui/components/table/use-table';
import { Table } from 'csdm/ui/components/table/table';
import type { TableInstance } from 'csdm/ui/components/table/table-types';
import { TableName } from 'csdm/node/settings/table/table-name';

function getRowId(analysis: Analysis) {
  return analysis.demoPath;
}

export function AnalysesTable() {
  const analyses: Analysis[] = useAnalyses();
  const selectedAnalysis = useSelectedAnalysis();
  const dispatch = useDispatch();
  const { showContextMenu } = useContextMenu();
  const columns = useAnalysesColumns();

  const onContextMenu = (event: MouseEvent) => {
    showContextMenu(event, <AnalysesContextMenu />);
  };

  const onSelectionChanged = (table: TableInstance<Analysis>) => {
    const analyses = table.getSelectedRows();
    if (analyses.length > 0) {
      dispatch(analysisSelected(analyses[0]));
    }
  };

  const selectedPaths = selectedAnalysis === undefined ? [] : [selectedAnalysis.demoPath];

  const table = useTable({
    columns,
    data: analyses,
    getRowId,
    selectedRowIds: selectedPaths,
    rowSelection: 'single',
    persistScrollKey: TableName.Analyses,
    onContextMenu,
    onSelectionChanged,
  });

  if (table.getRowCount() === 0) {
    return <NoAnalysis />;
  }

  return (
    <>
      <AnalysesActionBar />
      <Table<Analysis> table={table} />
    </>
  );
}
