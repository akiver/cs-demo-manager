import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { settingsUpdated } from 'csdm/ui/settings/settings-actions';
import { Status } from 'csdm/common/types/status';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { Loading } from './loading';
import { LoadingError } from './loading-error';

type Props = {
  children: ReactElement;
};

export function SettingsProvider({ children }: Props): ReactElement {
  const dispatch = useDispatch();
  const [status, setStatus] = useState<Status>(Status.Loading);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await window.csdm.parseSettingsFile();
        dispatch(settingsUpdated({ settings }));
        setStatus(Status.Success);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(JSON.stringify(error));
        }
        setStatus(Status.Error);
      }
    };

    loadSettings();
  }, [dispatch]);

  if (status === Status.Loading) {
    return <Loading />;
  }

  if (status === Status.Error) {
    return <LoadingError title={<Trans>An error occurred while loading settings.</Trans>} error={error} />;
  }

  return children;
}
