import React, { useEffect, useState } from 'react';
import { Control } from './control';
import { MaximizeIcon } from './maximize-icon';
import { UnMaximizeIcon } from './unmaximize-icon';

export function MaximizeControl() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    (async () => {
      const isWindowMaximized = await window.csdm.isWindowMaximized();
      setIsMaximized(isWindowMaximized);
    })();
  }, []);

  useEffect(() => {
    const onWindowUnMaximized = () => {
      setIsMaximized(false);
    };

    const onWindowMaximized = () => {
      setIsMaximized(true);
    };

    const unListenWindowUnMaximized = window.csdm.onWindowUnMaximized(onWindowUnMaximized);
    const unListenWindowMaximized = window.csdm.onWindowMaximized(onWindowMaximized);

    return () => {
      unListenWindowUnMaximized();
      unListenWindowMaximized();
    };
  }, []);

  const onUnMaximizeClick = () => {
    window.csdm.unMaximizeWindow();
  };
  const onMaximizeClick = () => {
    window.csdm.maximizeWindow();
  };

  return isMaximized ? (
    <Control onClick={onUnMaximizeClick}>
      <UnMaximizeIcon />
    </Control>
  ) : (
    <Control onClick={onMaximizeClick}>
      <MaximizeIcon />
    </Control>
  );
}
