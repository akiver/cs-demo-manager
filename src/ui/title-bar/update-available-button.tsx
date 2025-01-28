import React, { useEffect, useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { UpdateIcon } from 'csdm/ui/icons/update-icon';
import { Tooltip } from 'csdm/ui/components/tooltip';

export function UpdateAvailableButton() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    window.csdm.hasUpdateReadyToInstall().then(setUpdateAvailable);
  }, []);

  const onClick = () => {
    window.csdm.installUpdate();
  };

  useEffect(() => {
    const onUpdateDownloaded = () => {
      setUpdateAvailable(true);
    };

    const unListen = window.csdm.onUpdateDownloaded(onUpdateDownloaded);

    return () => {
      unListen();
    };
  }, []);

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="no-drag">
      <Tooltip content={<Trans>Update ready!</Trans>} placement="bottom" delay={0}>
        <button
          className="flex no-underline text-green-400 hover:text-green-700 duration-85 transition-all outline-hidden border border-transparent"
          onClick={onClick}
        >
          <UpdateIcon className="w-20" />
        </button>
      </Tooltip>
    </div>
  );
}
