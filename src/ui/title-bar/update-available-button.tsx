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
          className="flex border border-transparent text-green-400 no-underline outline-hidden transition-all duration-85 hover:text-green-700"
          onClick={onClick}
        >
          <UpdateIcon className="w-20" />
        </button>
      </Tooltip>
    </div>
  );
}
