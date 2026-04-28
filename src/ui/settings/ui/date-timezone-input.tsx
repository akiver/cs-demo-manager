import React, { useRef, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { FieldError } from 'csdm/ui/components/form/field-error';
import { useUiSettings } from './use-ui-settings';
import { useUpdateSettings } from '../use-update-settings';
import { ExternalLink } from 'csdm/ui/components/external-link';

export function DateTimezoneInput() {
  const { dateTimezone } = useUiSettings();
  const updateSettings = useUpdateSettings();
  const { t } = useLingui();
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const currentValue = useRef(dateTimezone ?? '');

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTimezone = event.target.value.trim();
    currentValue.current = newTimezone;

    if (!newTimezone) {
      setError('');
      setPreview('');
      return;
    }

    try {
      const formatted = new Intl.DateTimeFormat(undefined, {
        timeZone: newTimezone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      }).format(new Date());
      setError('');
      setPreview(formatted);
    } catch {
      setError(
        t({
          message: 'Invalid timezone.',
        }),
      );
      setPreview('');
    }
  };

  const onBlur = async () => {
    const value = currentValue.current;
    if (error || value !== dateTimezone) {
      await updateSettings({
        ui: {
          dateTimezone: error || !value ? undefined : value,
        },
      });
    }
  };

  return (
    <SettingsEntry
      interactiveComponent={
        <div className="flex flex-col gap-y-8">
          <TextInput
            onChange={onChange}
            onBlur={onBlur}
            defaultValue={dateTimezone}
            placeholder={Intl.DateTimeFormat().resolvedOptions().timeZone}
          />
          {preview && !error && <p className="text-gray-600">{preview}</p>}
          <FieldError error={error} />
        </div>
      }
      description={
        <p>
          <Trans>
            Timezone used to display dates. Uses the{' '}
            <ExternalLink href="https://wikipedia.org/wiki/List_of_tz_database_time_zones#List">
              IANA timezone format
            </ExternalLink>
            .
          </Trans>
        </p>
      }
      title={<Trans context="Settings title">Date timezone</Trans>}
    />
  );
}
