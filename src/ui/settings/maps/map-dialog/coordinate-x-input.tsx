import React from 'react';
import { Trans } from '@lingui/macro';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';
import { FieldError } from 'csdm/ui/settings/maps/map-dialog/field-error';
import { useMapFormField } from './use-map-form-field';

export function CoordinateXInput() {
  const { value, error, setField, validate } = useMapFormField('posX');

  return (
    <div className="flex flex-col gap-y-8">
      <InputLabel htmlFor="x">
        <Trans context="Input label">Coordinate X</Trans>
      </InputLabel>
      <InputNumber
        id="x"
        name="posX"
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
