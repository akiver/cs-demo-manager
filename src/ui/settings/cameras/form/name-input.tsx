import React from 'react';
import { Trans } from '@lingui/react/macro';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { FieldError } from 'csdm/ui/components/form/field-error';
import { useCameraFormField } from './use-camera-form-field';

type Props = {
  isDisabled?: boolean;
};

export function NameInput({ isDisabled }: Props) {
  const { value, error, setField } = useCameraFormField('name');

  return (
    <div className="flex flex-col gap-y-8">
      <div className="w-[224px]">
        <TextInput
          label={<Trans context="Input label">Name</Trans>}
          name="name"
          isDisabled={isDisabled}
          value={value}
          autoFocus={true}
          onChange={(event) => {
            setField(event.target.value);
          }}
        />
      </div>
      <FieldError error={error} />
    </div>
  );
}
