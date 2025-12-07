import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { isErrorCode } from 'csdm/common/is-error-code';
import { ErrorCode } from 'csdm/common/error-code';
import { useCurrentRenownAccount } from './use-current-renown-account';
import { fetchLastMatchesError, fetchLastMatchesStart, fetchLastMatchesSuccess } from './renown-actions';

export function useFetchLastRenownMatches() {
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const account = useCurrentRenownAccount();

  return async () => {
    if (!account) {
      return;
    }

    try {
      dispatch(fetchLastMatchesStart());
      const matches = await client.send({
        name: RendererClientMessageName.FetchLastRenownMatches,
        payload: account.id,
      });
      dispatch(fetchLastMatchesSuccess({ matches }));
    } catch (error) {
      const errorCode = isErrorCode(error) ? error : ErrorCode.UnknownError;
      dispatch(fetchLastMatchesError({ errorCode }));
    }
  };
}
