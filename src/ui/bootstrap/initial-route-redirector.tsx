import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useUiSettings } from '../settings/ui/use-ui-settings';
import { useArgument } from './use-argument';
import { ArgumentName } from 'csdm/common/argument/argument-name';
import { RoutePath, buildPendingDownloadPath } from '../routes-paths';
import { StartPath } from 'csdm/common/argument/start-path';
import { Page } from 'csdm/node/settings/page';
import { useSettingsOverlay } from '../settings/use-settings-overlay';

export function InitialRouteRedirector() {
  const { initialPage: defaultPage } = useUiSettings();
  const { openSettings } = useSettingsOverlay();
  const startPathArgument = useArgument(ArgumentName.StartPath);
  let to: RoutePath | string = RoutePath.Matches;

  useEffect(() => {
    if (startPathArgument !== StartPath.Settings) {
      return;
    }

    openSettings();
  }, [startPathArgument, openSettings]);

  if (startPathArgument && startPathArgument !== StartPath.Settings) {
    switch (startPathArgument) {
      case StartPath.Downloads:
        to = buildPendingDownloadPath();
        break;
      case StartPath.Players:
        to = RoutePath.Players;
        break;
      case StartPath.Bans:
        to = RoutePath.Ban;
        break;
    }
  } else {
    switch (defaultPage) {
      case Page.Demos:
        to = RoutePath.Demos;
        break;
      case Page.Download:
        to = RoutePath.Downloads;
        break;
      case Page.Players:
        to = RoutePath.Players;
        break;
    }
  }

  return <Navigate to={to} replace={true} />;
}
