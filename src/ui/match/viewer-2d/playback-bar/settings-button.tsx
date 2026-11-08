import React from 'react';
import { Trans } from '@lingui/react/macro';
import { CogsIcon } from 'csdm/ui/icons/cogs-icon';
import { useViewerContext } from '../use-viewer-context';
import { PlaybackBarButton } from './playback-bar-button';
import { Popover, PopoverContent, PopoverTrigger } from 'csdm/ui/components/popover/popover';
import { ResetButton } from 'csdm/ui/components/buttons/reset-button';
import { SettingSwitch } from './setting-switch';
import { BombDamageSettings } from './bomb-damage-settings';

function SettingsPopover() {
  const { settings, updateSettings, resetSettings } = useViewerContext();

  return (
    <div className="flex w-[320px] flex-col gap-y-8 rounded-8 bg-gray-100 p-8">
      <p className="text-body-strong">
        <Trans>Settings</Trans>
      </p>
      <SettingSwitch
        id="viewer-show-player-names"
        isChecked={settings.showPlayerNames}
        onChange={(showPlayerNames) => updateSettings({ showPlayerNames })}
      >
        <Trans>Player names</Trans>
      </SettingSwitch>
      <SettingSwitch
        id="viewer-show-kills-feed"
        isChecked={settings.showKillsFeed}
        onChange={(showKillsFeed) => updateSettings({ showKillsFeed })}
      >
        <Trans>Kills feed</Trans>
      </SettingSwitch>
      <SettingSwitch
        id="viewer-show-deaths"
        isChecked={settings.showDeaths}
        onChange={(showDeaths) => updateSettings({ showDeaths })}
      >
        <Trans>Death positions</Trans>
      </SettingSwitch>
      <SettingSwitch
        id="viewer-show-shots"
        isChecked={settings.showShots}
        onChange={(showShots) => updateSettings({ showShots })}
      >
        <Trans>Shots</Trans>
      </SettingSwitch>
      <SettingSwitch
        id="viewer-show-chickens"
        isChecked={settings.showChickens}
        onChange={(showChickens) => updateSettings({ showChickens })}
      >
        <Trans>Chickens</Trans>
      </SettingSwitch>
      <BombDamageSettings />
      <div className="border-t border-t-gray-300 pt-8">
        <ResetButton onClick={resetSettings} />
      </div>
    </div>
  );
}

export function SettingsButton() {
  return (
    <Popover openOnHover={true} closeDelay={300}>
      <PopoverTrigger asChild={true}>
        <PlaybackBarButton>
          <CogsIcon className="w-20" />
        </PlaybackBarButton>
      </PopoverTrigger>

      <PopoverContent>
        <SettingsPopover />
      </PopoverContent>
    </Popover>
  );
}
