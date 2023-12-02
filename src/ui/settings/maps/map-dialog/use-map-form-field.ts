import { useMapForm } from 'csdm/ui/settings/maps/map-dialog/use-map-form';
import type { FieldName } from 'csdm/ui/settings/maps/map-dialog/map-form-provider';

export function useMapFormField(name: FieldName) {
  const form = useMapForm();

  return {
    ...form.fields[name],
    validate: form.validateField.bind(form, name),
    setField: (value: string, error?: string | undefined) => form.setField(name, value, error),
  };
}
