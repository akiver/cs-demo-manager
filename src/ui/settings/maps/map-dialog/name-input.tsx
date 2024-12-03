import React from 'react';
import { Trans } from '@lingui/react/macro';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { FieldError } from 'csdm/ui/settings/maps/map-dialog/field-error';
import { useMapFormField } from './use-map-form-field';

type Props = {
  isDisabled?: boolean;
};

export function NameInput({ isDisabled }: Props) {
  const { value, error, setField, validate } = useMapFormField('name');

  return (
    <div className="flex flex-col gap-y-8">
      <div className="w-[224px]">
        <TextInput
          label={<Trans context="Input label">Name</Trans>}
          name="name"
          placeholder="de_example"
          isDisabled={isDisabled}
          value={value}
          autoFocus={true}
          onChange={(event) => {
            setField(event.target.value);
          }}
          onBlur={validate}
        />
      </div>
      <FieldError error={error} />
    </div>
  );
}
