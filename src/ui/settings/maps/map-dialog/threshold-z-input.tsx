import React from 'react';
import { Trans } from '@lingui/react/macro';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';
import { FieldError } from 'csdm/ui/settings/maps/map-dialog/field-error';
import { useMapFormField } from './use-map-form-field';

export function ThresholdZInput() {
  const { value, error, setField, validate } = useMapFormField('thresholdZ');

  return (
    <div className="flex flex-col gap-y-8">
      <InputLabel htmlFor="threshold-z">
        <Trans context="Input label">Threshold Z</Trans>
      </InputLabel>
      <InputNumber
        id="threshold-z"
        name="thresholdZ"
        placeholder="0"
        allowNegativeNumber={true}
        value={value}
        onChange={(event) => {
          setField(event.target.value);
        }}
        onBlur={validate}
      />
      <FieldError error={error} />
    </div>
  );
}
