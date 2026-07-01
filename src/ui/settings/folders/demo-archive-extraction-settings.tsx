import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Switch } from 'csdm/ui/components/inputs/switch';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';
import { uniqueArray } from 'csdm/common/array/unique-array';
import { type ArchiveFormat, supportedArchiveFormats } from 'csdm/common/types/archive-format';
import { useSettings } from 'csdm/ui/settings/use-settings';
import { useUpdateSettings } from 'csdm/ui/settings/use-update-settings';

function ArchiveFormatSwitch({ format }: { format: ArchiveFormat }) {
  const { autoExtractDemosFromArchives } = useSettings();
  const updateSettings = useUpdateSettings();
  const isChecked = autoExtractDemosFromArchives.includes(format);
  const id = `archive-format-${format}`;

  const onChange = async (checked: boolean) => {
    const newFormats = checked
      ? uniqueArray([...autoExtractDemosFromArchives, format])
      : autoExtractDemosFromArchives.filter((enabledFormat) => enabledFormat !== format);
    await updateSettings({ autoExtractDemosFromArchives: newFormats }, { preserveSourceArray: true });
  };

  return (
    <div className="flex items-center gap-x-4">
      <Switch id={id} isChecked={isChecked} onChange={onChange} />
      <label htmlFor={id} className="cursor-pointer text-body-strong">{`.${format}`}</label>
    </div>
  );
}

export function DemoArchiveExtractionSettings() {
  return (
    <div className="flex flex-col gap-y-8 border-b border-b-gray-300 pb-16">
      <div>
        <p className="text-body-strong">
          <Trans>Automatic demo extraction from archives</Trans>
        </p>
        <p className="mt-4 text-caption">
          <Trans>
            Automatically extract demos contained in archives found in your folders when scanning for demos. Extracted
            demos are placed next to their archive.
          </Trans>
        </p>
        <div className="mt-4 flex items-center gap-x-4">
          <ExclamationTriangleIcon className="size-12 shrink-0 text-orange-700" />
          <p className="text-caption">
            <Trans>Enabling automatic extraction has an impact on demo loading speed!</Trans>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-x-16">
        {supportedArchiveFormats.map((format) => {
          return <ArchiveFormatSwitch key={format} format={format} />;
        })}
      </div>
    </div>
  );
}
