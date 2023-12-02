import { useContext } from 'react';
import { SequenceFormContext } from './sequence-form-provider';

export function useSequenceForm() {
  const form = useContext(SequenceFormContext);

  return form;
}
