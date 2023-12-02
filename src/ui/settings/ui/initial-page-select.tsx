import React from 'react';
import { Trans, msg } from '@lingui/macro';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { useUpdateSettings } from '../use-update-settings';
import { Page } from 'csdm/node/settings/page';
import { useUiSettings } from './use-ui-settings';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

export function InitialPageSelect() {
  const _ = useI18n();
  const { initialPage } = useUiSettings();
  const updateSettings = useUpdateSettings();

  const labelPerPage: Record<Page, string> = {
    [Page.Matches]: _(
      msg({
        context: 'Select option initial page',
        message: 'Matches',
      }),
    ),
    [Page.Demos]: _(
      msg({
        context: 'Select option initial page',
        message: 'Demos',
      }),
    ),
    [Page.Players]: _(
      msg({
        context: 'Select option initial page',
        message: 'Players',
      }),
    ),
    [Page.Download]: _(
      msg({
        context: 'Select option initial page',
        message: 'Download',
      }),
    ),
  };

  const options: SelectOption<Page>[] = Object.values(Page).map((page) => {
    return {
      value: page,
      label: labelPerPage[page],
    };
  });

  return (
    <SettingsEntry
      interactiveComponent={
        <Select
          options={options}
          value={initialPage}
          onChange={async (page) => {
            await updateSettings({
              ui: {
                initialPage: page,
              },
            });
          }}
        />
      }
      description={<Trans>Initial page displayed on app startup</Trans>}
      title={<Trans context="Settings title">Initial page</Trans>}
    />
  );
}
