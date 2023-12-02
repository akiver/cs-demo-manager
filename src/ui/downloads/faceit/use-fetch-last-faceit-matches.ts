import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { fetchLastMatchesError, fetchLastMatchesStart, fetchLastMatchesSuccess } from './faceit-actions';
import { useCurrentFaceitAccount } from './use-current-faceit-account';
import { isErrorCode } from 'csdm/common/is-error-code';
import { ErrorCode } from 'csdm/common/error-code';

export function useFetchLastFaceitMatches() {
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const account = useCurrentFaceitAccount();

  return async () => {
    if (account === undefined) {
      return;
    }

    try {
      dispatch(fetchLastMatchesStart());
      const matches = await client.send({
        name: RendererClientMessageName.FetchLastFaceitMatches,
        payload: account.id,
      });
      dispatch(fetchLastMatchesSuccess({ matches }));
    } catch (error) {
      const errorCode = isErrorCode(error) ? error : ErrorCode.UnknownError;
      dispatch(fetchLastMatchesError({ errorCode }));
    }
  };
}
