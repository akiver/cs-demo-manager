import React from 'react';
import { DatabaseStatus } from 'csdm/ui/bootstrap/database-status';
import { useDatabaseStatus } from 'csdm/ui/bootstrap/use-database-status';
import { HistoryNavigation } from './history/history-navigation';
import { MenuButton } from './menu-button';
import { WindowControls } from './window-controls/window-controls';
import { UpdateAvailableButton } from './update-available-button';

export function TitleBar() {
  const databaseStatus = useDatabaseStatus();
  const onDoubleClick = async () => {
    if (!window.csdm.isMac) {
      return;
    }

    const isWindowMaximized = await window.csdm.isWindowMaximized();
    if (isWindowMaximized) {
      window.csdm.unMaximizeWindow();
    } else {
      window.csdm.maximizeWindow();
    }
  };

  return (
    <div
      onDoubleClick={onDoubleClick}
      className="flex items-center text-gray-900 bg-gray-50 border-b border-b-gray-300 h-[var(--title-bar-height)] overflow-hidden drag"
    >
      {!window.csdm.isMac && <MenuButton />}
      <div className="flex items-center gap-x-16 mx-auto">
        {databaseStatus === DatabaseStatus.Connected && <HistoryNavigation />}
        <p>{`CS Demo Manager ${APP_VERSION}`}</p>
        <UpdateAvailableButton />
      </div>
      {!window.csdm.isMac && <WindowControls />}
    </div>
  );
}
