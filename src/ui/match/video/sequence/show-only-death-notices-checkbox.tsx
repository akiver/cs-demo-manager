import React from 'react';
import { useSequenceForm } from './use-sequence-form';
import { ShowOnlyDeathNoticesCheckbox } from '../show-only-death-notices-checkbox';

export function SequenceShowOnlyDeathNoticesCheckbox() {
  const { sequence, updateSequence } = useSequenceForm();

  const onChange = (isChecked: boolean) => {
    updateSequence({
      showOnlyDeathNotices: isChecked,
    });
  };

  return <ShowOnlyDeathNoticesCheckbox onChange={onChange} isChecked={sequence.showOnlyDeathNotices} />;
}
