import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { useUpdateSettings } from '../use-update-settings';
import { Page } from 'csdm/node/settings/page';
import { useUiSettings } from './use-ui-settings';

export function InitialPageSelect() {
  const { t } = useLingui();
  const { initialPage } = useUiSettings();
  const updateSettings = useUpdateSettings();

  const labelPerPage: Record<Page, string> = {
    [Page.Matches]: t({
      context: 'Select option initial page',
      message: 'Matches',
    }),
    [Page.Demos]: t({
      context: 'Select option initial page',
      message: 'Demos',
    }),
    [Page.Players]: t({
      context: 'Select option initial page',
      message: 'Players',
    }),
    [Page.Download]: t({
      context: 'Select option initial page',
      message: 'Download',
    }),
    [Page.Teams]: t({
      context: 'Select option initial page',
      message: 'Teams',
    }),
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
