import React, { useId } from 'react';
import { Trans } from '@lingui/react/macro';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { FieldError } from 'csdm/ui/components/form/field-error';
import { useCameraFormField } from './use-camera-form-field';
import { CameraCoordinatesInputNumber } from './camera-coordinates-input-number';

export function CoordinateZInput() {
  const id = useId();
  const { value, error, setField } = useCameraFormField('z');

  return (
    <div className="flex flex-col gap-y-8">
      <InputLabel htmlFor={id}>
        <Trans context="Input label">Coordinate Z</Trans>
      </InputLabel>
      <CameraCoordinatesInputNumber id={id} name="z" value={value} onChange={setField} />
      <FieldError error={error} />
    </div>
  );
}
