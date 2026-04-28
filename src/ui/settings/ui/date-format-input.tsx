import React, { useRef, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { format } from 'date-fns';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { FieldError } from 'csdm/ui/components/form/field-error';
import { ExternalLink } from 'csdm/ui/components/external-link';
import { useUiSettings } from './use-ui-settings';
import { useUpdateSettings } from '../use-update-settings';

export function DateFormatInput() {
  const { dateFormat } = useUiSettings();
  const updateSettings = useUpdateSettings();
  const { t } = useLingui();
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const now = useRef(new Date());
  const currentValue = useRef(dateFormat ?? '');

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDateFormat = event.target.value.trim();
    currentValue.current = newDateFormat;

    if (!newDateFormat) {
      setError('');
      setPreview('');
      return;
    }

    try {
      const formatted = format(now.current, newDateFormat);
      setError('');
      setPreview(formatted);
    } catch {
      setError(
        t({
          message: 'Invalid date format.',
        }),
      );
      setPreview('');
    }
  };

  const onBlur = async () => {
    const value = currentValue.current;
    if (error || value !== dateFormat) {
      await updateSettings({
        ui: {
          dateFormat: error || !value ? undefined : value,
        },
      });
    }
  };

  return (
    <SettingsEntry
      interactiveComponent={
        <div className="flex flex-col gap-y-8">
          <TextInput onChange={onChange} onBlur={onBlur} defaultValue={dateFormat} placeholder="dd/MM/yyyy HH:mm:ss" />
          {preview && !error && <p className="text-gray-600">{preview}</p>}
          <FieldError error={error} />
        </div>
      }
      description={
        <div className="flex flex-col gap-y-4">
          <p>
            <Trans>Defines how dates are displayed.</Trans>{' '}
            <span>
              <Trans>
                See all <ExternalLink href="https://date-fns.org/docs/format">available tokens</ExternalLink>.
              </Trans>
            </span>
          </p>
        </div>
      }
      title={<Trans context="Settings title">Date format</Trans>}
    />
  );
}
