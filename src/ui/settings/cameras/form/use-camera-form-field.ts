import type { FieldName } from './camera-form-provider';
import { useCameraForm } from './use-camera-form';

export function useCameraFormField(name: FieldName) {
  const form = useCameraForm();

  return {
    ...form.fields[name],
    validate: form.validateField.bind(form, name),
    setField: (value: string, error?: string | undefined) => form.setField(name, value, error),
  };
}
