import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { CS2PluginVersion as PluginVersion } from 'csdm/common/types/cs2-plugin-version';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';
import { useFormatDate } from 'csdm/ui/hooks/use-format-date';
import { ExternalLink } from 'csdm/ui/components/external-link';
import { usePlaybackSettings } from './use-playback-settings';

export function Cs2PluginSelect() {
  const { cs2PluginVersion } = usePlaybackSettings();
  const { updateSettings } = usePlaybackSettings();
  const formatDate = useFormatDate();
  const version = cs2PluginVersion ?? PluginVersion.latest;

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  };
  const armoryUpdateDate = formatDate('2024-10-03', dateOptions);
  const animationUpdateDate = formatDate('2025-07-28', dateOptions);
  const update14095 = formatDate('2025-08-14', dateOptions);

  const options: SelectOption<PluginVersion>[] = Object.values(PluginVersion).map((version) => ({
    value: version,
    label: version === PluginVersion.latest ? <Trans>Latest</Trans> : version,
  }));

  const renderWarning = () => {
    switch (version) {
      case PluginVersion[14030]:
        return (
          <p>
            <Trans>
              You selected a version compatible with CS2 from the Limited Test up to the 'Armory' update (
              {armoryUpdateDate}).
            </Trans>
          </p>
        );
      case PluginVersion[14088]:
        return (
          <div>
            <p>
              <Trans>
                You selected a version compatible with CS2 from the 'Armory' update ({armoryUpdateDate}) up to the
                'Animation' update released on {animationUpdateDate}.
              </Trans>
            </p>
            <p>
              <Trans>
                If not using a custom build, you must select the CS2 beta branch <strong>"1.40.8.8"</strong> in your
                Steam library to use this version.
              </Trans>
            </p>
          </div>
        );
      case PluginVersion[14094]:
        return (
          <div>
            <p>
              <Trans>
                You selected a version compatible with CS2 from the 'Animation' update ({animationUpdateDate}) up to the{' '}
                {update14095} update.
              </Trans>
            </p>
            <p>
              <Trans>
                If not using a custom build, you must select the CS2 beta branch <strong>"1.40.9.4"</strong> in your
                Steam library to use this version.
              </Trans>
            </p>
          </div>
        );
      default:
        return (
          <p>
            <Trans>
              Change this only if you want to watch old demos that are not compatible with the latest CS2 update!
            </Trans>
          </p>
        );
    }
  };

  return (
    <SettingsEntry
      interactiveComponent={
        <div>
          <Select
            options={options}
            value={cs2PluginVersion ?? PluginVersion.latest}
            onChange={async (version) => {
              await updateSettings({
                cs2PluginVersion: version,
              });
            }}
          />
        </div>
      }
      description={
        <div className="flex flex-col gap-y-8">
          <div>
            <p>
              <Trans>The version of the internal CS2 plugin used to communicate with the game during playback.</Trans>
            </p>
            <p>
              <Trans>
                See the{' '}
                <ExternalLink href="https://cs-demo-manager.com/docs/guides/playback#cs2-plugin-compatibility">
                  documentation
                </ExternalLink>{' '}
                for more information.
              </Trans>
            </p>
          </div>
          <div className="flex items-center gap-x-4">
            <ExclamationTriangleIcon className="size-16 shrink-0 text-red-700" />
            {renderWarning()}
          </div>
          {window.csdm.isWindows && version !== PluginVersion.latest && (
            <div className="flex items-center gap-x-4">
              <ExclamationTriangleIcon className="size-12 shrink-0 text-orange-700" />
              <div>
                <p className="text-caption">
                  <Trans>
                    If you plan to use HLAE, you must install a version of HLAE that is compatible with the selected CS2
                    beta branch!
                  </Trans>
                </p>
              </div>
            </div>
          )}
        </div>
      }
      title={<Trans context="Settings title">CS2 plugin</Trans>}
    />
  );
}
