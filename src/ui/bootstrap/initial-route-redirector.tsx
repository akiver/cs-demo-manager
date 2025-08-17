import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
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
  const navigate = useNavigate();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current) {
      return;
    }

    if (startPathArgument === StartPath.Settings) {
      openSettings();
    }

    let to: string = RoutePath.Matches;
    if (startPathArgument && startPathArgument !== StartPath.Settings) {
      switch (startPathArgument) {
        case StartPath.Bans:
          to = RoutePath.Ban;
          break;
        case StartPath.Demos:
          to = RoutePath.Demos;
          break;
        case StartPath.Downloads:
          to = buildPendingDownloadPath();
          break;
        case StartPath.Matches:
          to = RoutePath.Matches;
          break;
        case StartPath.Players:
          to = RoutePath.Players;
          break;
        case StartPath.Search:
          to = RoutePath.Search;
          break;
        case StartPath.Teams:
          to = RoutePath.Teams;
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
        case Page.Teams:
          to = RoutePath.Teams;
          break;
      }
    }

    navigate(to, { replace: true });
    hasRedirected.current = true;
  }, [defaultPage, navigate, openSettings, startPathArgument]);

  return null;
}
