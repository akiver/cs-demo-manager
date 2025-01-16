import React, { useId } from 'react';
import { Trans } from '@lingui/react/macro';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';
import { FieldError } from 'csdm/ui/settings/maps/map-dialog/field-error';
import { useMapFormField } from './use-map-form-field';

export function CoordinateXInput() {
  const id = useId();
  const { value, error, setField, validate } = useMapFormField('posX');

  return (
    <div className="flex flex-col gap-y-8">
      <InputLabel htmlFor={id}>
        <Trans context="Input label">Coordinate X</Trans>
      </InputLabel>
      <InputNumber
        id={id}
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
