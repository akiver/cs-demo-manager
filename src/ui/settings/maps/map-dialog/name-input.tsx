import React from 'react';
import { Trans } from '@lingui/macro';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
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
      <InputLabel htmlFor="map-name">
        <Trans context="Input label">Name</Trans>
      </InputLabel>
      <div className="w-[224px]">
        <TextInput
          id="map-name"
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
