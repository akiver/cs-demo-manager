import React from 'react';
import { Trans } from '@lingui/macro';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';
import { FieldError } from 'csdm/ui/settings/maps/map-dialog/field-error';
import { useMapFormField } from './use-map-form-field';

export function CoordinateYInput() {
  const { value, error, setField, validate } = useMapFormField('posY');

  return (
    <div className="flex flex-col gap-y-8">
      <InputLabel htmlFor="y">
        <Trans context="Input label">Coordinate Y</Trans>
      </InputLabel>
      <InputNumber
        id="y"
        name="posY"
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
