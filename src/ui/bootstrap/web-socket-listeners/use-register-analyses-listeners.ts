import { useEffect } from 'react';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import {
  demosAddedToAnalyses,
  demoRemovedFromAnalyses,
  analysisUpdated,
  insertMatchSuccess,
} from 'csdm/ui/analyses/analyses-actions';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import type { WebSocketClient } from 'csdm/ui/web-socket-client';
import type { Analysis } from 'csdm/common/types/analysis';
import type { MatchTable } from 'csdm/common/types/match-table';

export function useRegisterAnalysesListeners(client: WebSocketClient) {
  const dispatch = useDispatch();

  useEffect(() => {
    const onDemoAddedToAnalyses = (analyses: Analysis[]) => {
      dispatch(demosAddedToAnalyses(analyses));
    };
    client.on(RendererServerMessageName.DemosAddedToAnalyses, onDemoAddedToAnalyses);

    const onDemosRemovedFromAnalyses = (demoIds: string[]) => {
      dispatch(demoRemovedFromAnalyses(demoIds));
    };
    client.on(RendererServerMessageName.DemosRemovedFromAnalyses, onDemosRemovedFromAnalyses);

    const onAnalysisUpdated = (analysis: Analysis) => {
      dispatch(analysisUpdated(analysis));
    };
    client.on(RendererServerMessageName.AnalysisUpdated, onAnalysisUpdated);

    const onMatchInserted = (match: MatchTable) => {
      dispatch(insertMatchSuccess(match));
    };
    client.on(RendererServerMessageName.MatchInserted, onMatchInserted);

    return () => {
      client.off(RendererServerMessageName.DemosAddedToAnalyses, onDemoAddedToAnalyses);
      client.off(RendererServerMessageName.DemosRemovedFromAnalyses, onDemosRemovedFromAnalyses);
      client.off(RendererServerMessageName.AnalysisUpdated, onAnalysisUpdated);
      client.off(RendererServerMessageName.MatchInserted, onMatchInserted);
    };
  });
}
