import React, { useId } from 'react';
import { Trans } from '@lingui/react/macro';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';
import { FieldError } from 'csdm/ui/settings/maps/map-dialog/field-error';
import { useMapFormField } from './use-map-form-field';

export function ScaleInput() {
  const id = useId();
  const { value, error, setField, validate } = useMapFormField('scale');

  return (
    <div className="flex flex-col gap-y-8">
      <InputLabel htmlFor={id}>
        <Trans context="Input label">Scale</Trans>
      </InputLabel>
      <InputNumber
        id={id}
        name="scale"
        placeholder="0"
        allowDecimal={true}
        min={0}
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
