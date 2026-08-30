import { useEffect } from 'react';
import { ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';
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
    client.on(ServerPushMessageName.DemosAddedToAnalyses, onDemoAddedToAnalyses);

    const onDemosRemovedFromAnalyses = (demoIds: string[]) => {
      dispatch(demoRemovedFromAnalyses(demoIds));
    };
    client.on(ServerPushMessageName.DemosRemovedFromAnalyses, onDemosRemovedFromAnalyses);

    const onAnalysisUpdated = (analysis: Analysis) => {
      dispatch(analysisUpdated(analysis));
    };
    client.on(ServerPushMessageName.AnalysisUpdated, onAnalysisUpdated);

    const onMatchInserted = (match: MatchTable) => {
      dispatch(insertMatchSuccess(match));
    };
    client.on(ServerPushMessageName.MatchInserted, onMatchInserted);

    return () => {
      client.off(ServerPushMessageName.DemosAddedToAnalyses, onDemoAddedToAnalyses);
      client.off(ServerPushMessageName.DemosRemovedFromAnalyses, onDemosRemovedFromAnalyses);
      client.off(ServerPushMessageName.AnalysisUpdated, onAnalysisUpdated);
      client.off(ServerPushMessageName.MatchInserted, onMatchInserted);
    };
  });
}
