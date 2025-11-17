import React, { useId } from 'react';
import { Trans } from '@lingui/react/macro';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { FieldError } from 'csdm/ui/components/form/field-error';
import { useCameraFormField } from './use-camera-form-field';
import { ColorPicker } from 'csdm/ui/components/inputs/color-picker';

export function CameraColorInput() {
  const id = useId();
  const { value, error, setField } = useCameraFormField('color');

  return (
    <div className="flex flex-col gap-y-8">
      <InputLabel htmlFor={id}>
        <Trans context="Input label">Color</Trans>
      </InputLabel>
      <ColorPicker
        id={id}
        value={value}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setField(event.target.value);
        }}
      />
      <FieldError error={error} />
    </div>
  );
}
