import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { fetchLastMatchesError, fetchLastMatchesStart, fetchLastMatchesSuccess } from './5eplay-actions';
import { isErrorCode } from 'csdm/common/is-error-code';
import { ErrorCode } from 'csdm/common/error-code';
import { useCurrent5EPlayAccount } from './use-current-5eplay-account';

export function useFetchLast5EPlayMatches() {
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const account = useCurrent5EPlayAccount();

  return async () => {
    if (account === undefined) {
      return;
    }

    try {
      dispatch(fetchLastMatchesStart());
      const matches = await client.send({
        name: RendererClientMessageName.FetchLast5EPlayMatches,
        payload: account.id,
      });
      dispatch(fetchLastMatchesSuccess({ matches }));
    } catch (error) {
      const errorCode = isErrorCode(error) ? error : ErrorCode.UnknownError;
      dispatch(fetchLastMatchesError({ errorCode }));
    }
  };
}
